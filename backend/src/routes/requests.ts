import { Router, Request, Response } from 'express';
import { RequestStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { getIO } from '../lib/socket';
import { requirePatron, requireDj } from '../middleware/auth';

const router = Router();

type PatronRequest = Request & { userId: string };
type DjRequest = Request & { djId: string };

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
    const { djId, venueId, deezerTrackId, songTitle, artistName, albumArtUrl } = req.body;
    if (!djId || !venueId || !deezerTrackId || !songTitle || !artistName) {
      res.status(400).json({ error: 'djId, venueId, deezerTrackId, songTitle, artistName are required' });
      return;
    }
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
    const { status, playedAt } = req.body as { status?: RequestStatus; playedAt?: string | null };
    const existing = await prisma.request.findFirst({
      where: { id, djId: req.djId },
    });
    if (!existing) {
      res.status(404).json({ error: 'Request not found' });
      return;
    }
    const data: { status?: RequestStatus; playedAt?: Date | null } = {};
    if (status !== undefined) {
      const valid: RequestStatus[] = ['pending', 'accepted', 'declined', 'played'];
      if (!valid.includes(status)) {
        res.status(400).json({ error: 'Invalid status' });
        return;
      }
      data.status = status;
    }
    if (playedAt !== undefined) data.playedAt = playedAt ? new Date(playedAt) : null;
    if (status === 'played' && data.playedAt === undefined) data.playedAt = new Date();
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
