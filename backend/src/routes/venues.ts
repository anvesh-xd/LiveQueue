import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireDj } from '../middleware/auth';

const router = Router();

type DjRequest = Request & { djId: string };

// Validation schemas
const createVenueSchema = z.object({
  name: z.string().min(1, 'Venue name is required').max(100, 'Venue name too long').trim(),
  address: z.string().max(500, 'Address too long').trim().optional(),
});

function flattenVenue(v: {
  id: string;
  name: string;
  address: string | null;
  djs: { djId: string; dj: { id: string; name: string } }[];
}) {
  return {
    id: v.id,
    name: v.name,
    address: v.address,
    djs: v.djs.map((d) => ({ id: d.dj.id, name: d.dj.name })),
  };
}

// GET /venues/dj — list venues linked to current DJ (DJ only)
router.get('/dj', requireDj, async (req: DjRequest, res: Response) => {
  try {
    const venues = await prisma.venue.findMany({
      where: { djs: { some: { djId: req.djId } } },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        address: true,
        djs: {
          select: { djId: true, dj: { select: { id: true, name: true } } },
        },
      },
    });
    res.json(venues.map(flattenVenue));
  } catch (e) {
    console.error('GET /venues/dj error:', e);
    res.status(500).json({ error: 'Failed to fetch your venues' });
  }
});

// GET /venues — list all venues with their DJs (public)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const venues = await prisma.venue.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        address: true,
        djs: {
          select: { djId: true, dj: { select: { id: true, name: true } } },
        },
      },
    });
    res.json(venues.map(flattenVenue));
  } catch (e) {
    console.error('GET /venues error:', e);
    res.status(500).json({ error: 'Failed to fetch venues' });
  }
});

// POST /venues — create venue and link current DJ (DJ only)
router.post('/', requireDj, async (req: DjRequest, res: Response) => {
  try {
    const result = createVenueSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error.errors[0].message });
      return;
    }
    const { name, address } = result.data;
    
    const venue = await prisma.venue.create({
      data: {
        name,
        address: address || null,
      },
      select: {
        id: true,
        name: true,
        address: true,
        djs: {
          select: { djId: true, dj: { select: { id: true, name: true } } },
        },
      },
    });
    await prisma.venueDJ.create({
      data: { venueId: venue.id, djId: req.djId },
    });
    const withDjs = await prisma.venue.findUnique({
      where: { id: venue.id },
      select: {
        id: true,
        name: true,
        address: true,
        djs: {
          select: { djId: true, dj: { select: { id: true, name: true } } },
        },
      },
    });
    res.status(201).json(withDjs ? flattenVenue(withDjs) : flattenVenue(venue));
  } catch (e) {
    console.error('POST /venues error:', e);
    res.status(500).json({ error: 'Failed to create venue' });
  }
});

// POST /venues/:venueId/link — link current DJ to existing venue (DJ only)
router.post('/:venueId/link', requireDj, async (req: DjRequest, res: Response) => {
  try {
    const { venueId } = req.params;
    const existing = await prisma.venue.findUnique({
      where: { id: venueId },
      select: { id: true, name: true, address: true, djs: { select: { djId: true, dj: { select: { id: true, name: true } } } } },
    });
    if (!existing) {
      res.status(404).json({ error: 'Venue not found' });
      return;
    }
    const already = await prisma.venueDJ.findUnique({
      where: { venueId_djId: { venueId, djId: req.djId } },
    });
    if (already) {
      res.status(409).json({ error: 'You are already linked to this venue' });
      return;
    }
    await prisma.venueDJ.create({
      data: { venueId, djId: req.djId },
    });
    const updated = await prisma.venue.findUnique({
      where: { id: venueId },
      select: {
        id: true,
        name: true,
        address: true,
        djs: {
          select: { djId: true, dj: { select: { id: true, name: true } } },
        },
      },
    });
    res.status(201).json(updated ? flattenVenue(updated) : { id: existing.id, name: existing.name, address: existing.address, djs: existing.djs.map((d) => ({ id: d.dj.id, name: d.dj.name })) });
  } catch (e) {
    console.error('POST /venues/:venueId/link error:', e);
    res.status(500).json({ error: 'Failed to link to venue' });
  }
});

export default router;
