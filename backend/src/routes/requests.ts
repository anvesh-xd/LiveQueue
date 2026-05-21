import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { RequestStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { getIO } from '../lib/socket';
import { requirePatron, requireDj } from '../middleware/auth';

const router = Router();

type PatronRequest = Request & { userId: string };
type DjRequest = Request & { djId: string };

// Patrons can only submit one request per (venue, DJ) every 30 minutes.
const REQUEST_COOLDOWN_MS = 30 * 60 * 1000;

// Validation schemas
const createRequestSchema = z.object({
  djId: z.string().cuid('Invalid DJ ID'),
  venueId: z.string().cuid('Invalid venue ID'),
  deezerTrackId: z.string().min(1, 'Track ID is required').max(100),
  songTitle: z.string().min(1, 'Song title is required').max(200).trim(),
  artistName: z.string().min(1, 'Artist name is required').max(200).trim(),
  albumArtUrl: z.string().url('Invalid album art URL').max(500).optional().nullable(),
});

const updateRequestSchema = z.object({
  status: z.enum(['pending', 'accepted', 'declined', 'played']).optional(),
  playedAt: z.string().datetime().optional().nullable(),
});

const reorderSchema = z.object({
  orderedIds: z.array(z.string().cuid()).min(1).max(200),
});

const requestSelect = {
  id: true,
  userId: true,
  djId: true,
  venueId: true,
  deezerTrackId: true,
  songTitle: true,
  artistName: true,
  albumArtUrl: true,
  status: true,
  position: true,
  createdAt: true,
  updatedAt: true,
  playedAt: true,
  user: { select: { id: true, name: true, email: true } },
  venue: { select: { id: true, name: true } },
};

// POST /requests — create request (patron only)
router.post('/', requirePatron, async (req: Request, res: Response) => {
  const patronReq = req as PatronRequest;
  try {
    const result = createRequestSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error.issues[0].message });
      return;
    }
    const { djId, venueId, deezerTrackId, songTitle, artistName, albumArtUrl } = result.data;

    // Enforce per-patron, per-(venue, DJ) cooldown to limit spam.
    // We only count requests that the DJ hasn't already declined, so a rejected
    // request unblocks the patron immediately.
    const recent = await prisma.request.findFirst({
      where: {
        userId: patronReq.userId,
        venueId,
        djId,
        status: { not: 'declined' },
        createdAt: { gte: new Date(Date.now() - REQUEST_COOLDOWN_MS) },
      },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });
    if (recent) {
      const elapsedMs = Date.now() - recent.createdAt.getTime();
      const retryAfterSec = Math.max(1, Math.ceil((REQUEST_COOLDOWN_MS - elapsedMs) / 1000));
      const minutes = Math.ceil(retryAfterSec / 60);
      res.setHeader('Retry-After', String(retryAfterSec));
      res.status(429).json({
        error: `You can request another track from this DJ in about ${minutes} minute${minutes === 1 ? '' : 's'}.`,
        retryAfterSec,
      });
      return;
    }

    const request = await prisma.request.create({
      data: {
        userId: patronReq.userId,
        djId,
        venueId,
        deezerTrackId,
        songTitle,
        artistName,
        albumArtUrl: albumArtUrl ?? null,
      },
      select: requestSelect,
    });
    getIO()?.to(`venue:${venueId}`).emit('request:new', request);
    getIO()?.to(`dj:${djId}`).emit('request:new', request);
    res.status(201).json(request);
  } catch (e) {
    console.error('POST /requests error:', e);
    res.status(500).json({ error: 'Failed to create request' });
  }
});

// GET /requests/me — my requests (patron only)
router.get('/me', requirePatron, async (req: Request, res: Response) => {
  const patronReq = req as PatronRequest;
  try {
    const requests = await prisma.request.findMany({
      where: { userId: patronReq.userId },
      orderBy: { createdAt: 'desc' },
      select: requestSelect,
    });
    res.json(requests);
  } catch (e) {
    console.error('GET /requests/me error:', e);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// GET /requests/dj — requests for this DJ (optional ?venueId)
router.get('/dj', requireDj, async (req: Request, res: Response) => {
  const djReq = req as DjRequest;
  try {
    const venueId = req.query.venueId as string | undefined;
    const where: { djId: string; venueId?: string } = { djId: djReq.djId };
    if (venueId) where.venueId = venueId;
    // Accepted requests sort by position (the DJ's queue order); everything
    // else falls back to creation time so pending newest-first and history
    // both stay stable. We multi-sort and let the client split by status.
    const requests = await prisma.request.findMany({
      where,
      orderBy: [
        { status: 'asc' },
        { position: { sort: 'asc', nulls: 'last' } },
        { createdAt: 'asc' },
      ],
      select: requestSelect,
    });
    res.json(requests);
  } catch (e) {
    console.error('GET /requests/dj error:', e);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// POST /requests/reorder — reorder accepted queue for a DJ
// Body: { orderedIds: string[] }
// All ids must belong to this DJ and be 'accepted'. Positions are rewritten in
// the given order starting at 1.
router.post('/reorder', requireDj, async (req: Request, res: Response) => {
  const djReq = req as DjRequest;
  try {
    const result = reorderSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error.issues[0].message });
      return;
    }
    const { orderedIds } = result.data;

    const owned = await prisma.request.findMany({
      where: { id: { in: orderedIds }, djId: djReq.djId, status: 'accepted' },
      select: { id: true, venueId: true },
    });
    if (owned.length !== orderedIds.length) {
      res.status(400).json({ error: 'Some requests do not belong to you or are not accepted' });
      return;
    }

    await prisma.$transaction(
      orderedIds.map((id, idx) =>
        prisma.request.update({
          where: { id },
          data: { position: idx + 1 },
        })
      )
    );

    const updated = await prisma.request.findMany({
      where: { id: { in: orderedIds } },
      orderBy: { position: 'asc' },
      select: requestSelect,
    });

    const io = getIO();
    if (io) {
      const venueIds = Array.from(new Set(owned.map((r) => r.venueId)));
      venueIds.forEach((vid) => io.to(`venue:${vid}`).emit('queue:reordered', updated));
      io.to(`dj:${djReq.djId}`).emit('queue:reordered', updated);
    }

    res.json(updated);
  } catch (e) {
    console.error('POST /requests/reorder error:', e);
    res.status(500).json({ error: 'Failed to reorder requests' });
  }
});

// PATCH /requests/:id — update status (DJ only)
router.patch('/:id', requireDj, async (req: Request, res: Response) => {
  const djReq = req as DjRequest;
  try {
    const { id } = req.params;
    const result = updateRequestSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error.issues[0].message });
      return;
    }
    
    const existing = await prisma.request.findFirst({
      where: { id, djId: djReq.djId },
    });
    if (!existing) {
      res.status(404).json({ error: 'Request not found' });
      return;
    }
    
    const data: {
      status?: RequestStatus;
      playedAt?: Date | null;
      position?: number | null;
    } = {};
    if (result.data.status !== undefined) {
      data.status = result.data.status as RequestStatus;
    }
    if (result.data.playedAt !== undefined) {
      data.playedAt = result.data.playedAt ? new Date(result.data.playedAt) : null;
    }
    if (result.data.status === 'played' && data.playedAt === undefined) {
      data.playedAt = new Date();
    }

    // Queue position management:
    //  - Moving INTO 'accepted' → assign the next position for this DJ.
    //  - Moving OUT of 'accepted' → clear the position so we don't leave gaps.
    if (data.status !== undefined && data.status !== existing.status) {
      if (data.status === 'accepted') {
        const last = await prisma.request.findFirst({
          where: { djId: djReq.djId, status: 'accepted', position: { not: null } },
          orderBy: { position: 'desc' },
          select: { position: true },
        });
        data.position = (last?.position ?? 0) + 1;
      } else if (existing.status === 'accepted') {
        data.position = null;
      }
    }

    const updated = await prisma.request.update({
      where: { id },
      data,
      select: requestSelect,
    });
    getIO()?.to(`venue:${updated.venueId}`).emit('request:updated', updated);
    getIO()?.to(`user:${updated.userId}`).emit('request:updated', updated);
    getIO()?.to(`dj:${updated.djId}`).emit('request:updated', updated);
    res.json(updated);
  } catch (e) {
    console.error('PATCH /requests/:id error:', e);
    res.status(500).json({ error: 'Failed to update request' });
  }
});

export default router;
