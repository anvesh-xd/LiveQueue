import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { RequestStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { getIO } from '../lib/socket';
import { requirePatron, requireDj } from '../middleware/auth';

const router = Router();

type PatronRequest = Request & { userId: string };
type DjRequest = Request & { djId: string };

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
  createdAt: true,
  updatedAt: true,
  playedAt: true,
  user: { select: { id: true, name: true, email: true } },
  venue: { select: { id: true, name: true } },
};

// POST /requests — create request (patron only)
router.post('/', requirePatron, async (req: PatronRequest, res: Response) => {
  try {
    const result = createRequestSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error.errors[0].message });
      return;
    }
    const { djId, venueId, deezerTrackId, songTitle, artistName, albumArtUrl } = result.data;
    
    const request = await prisma.request.create({
      data: {
        userId: req.userId,
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
router.get('/me', requirePatron, async (req: PatronRequest, res: Response) => {
  try {
    const requests = await prisma.request.findMany({
      where: { userId: req.userId },
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
router.get('/dj', requireDj, async (req: DjRequest, res: Response) => {
  try {
    const venueId = req.query.venueId as string | undefined;
    const where: { djId: string; venueId?: string } = { djId: req.djId };
    if (venueId) where.venueId = venueId;
    const requests = await prisma.request.findMany({
      where,
      orderBy: [{ status: 'asc' }, { createdAt: 'asc' }],
      select: requestSelect,
    });
    res.json(requests);
  } catch (e) {
    console.error('GET /requests/dj error:', e);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// PATCH /requests/:id — update status (DJ only)
router.patch('/:id', requireDj, async (req: DjRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = updateRequestSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error.errors[0].message });
      return;
    }
    
    const existing = await prisma.request.findFirst({
      where: { id, djId: req.djId },
    });
    if (!existing) {
      res.status(404).json({ error: 'Request not found' });
      return;
    }
    
    const data: { status?: RequestStatus; playedAt?: Date | null } = {};
    if (result.data.status !== undefined) {
      data.status = result.data.status as RequestStatus;
    }
    if (result.data.playedAt !== undefined) {
      data.playedAt = result.data.playedAt ? new Date(result.data.playedAt) : null;
    }
    if (result.data.status === 'played' && data.playedAt === undefined) {
      data.playedAt = new Date();
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
