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

const updateVenueSchema = z.object({
  name: z.string().min(1).max(100).trim().optional(),
  address: z.string().max(500).trim().optional().nullable(),
});

const setActiveSchema = z.object({
  isActive: z.boolean(),
});

type VenueWithDjs = {
  id: string;
  name: string;
  address: string | null;
  logoUrl: string | null;
  djs: { djId: string; isActive: boolean; dj: { id: string; name: string } }[];
};

function flattenVenue(v: VenueWithDjs) {
  return {
    id: v.id,
    name: v.name,
    address: v.address,
    logoUrl: v.logoUrl,
    djs: v.djs.map((d) => ({
      id: d.dj.id,
      name: d.dj.name,
      isActive: d.isActive,
    })),
  };
}

const venueSelect = {
  id: true,
  name: true,
  address: true,
  logoUrl: true,
  djs: {
    select: { djId: true, isActive: true, dj: { select: { id: true, name: true } } },
  },
} as const;

// GET /venues/dj — list venues linked to current DJ (DJ only)
router.get('/dj', requireDj, async (req: Request, res: Response) => {
  const djReq = req as DjRequest;
  try {
    const venues = await prisma.venue.findMany({
      where: { djs: { some: { djId: djReq.djId } } },
      orderBy: { name: 'asc' },
      select: venueSelect,
    });
    res.json(venues.map(flattenVenue));
  } catch (e) {
    console.error('GET /venues/dj error:', e);
    res.status(500).json({ error: 'Failed to fetch your venues' });
  }
});

// GET /venues — list venues with at least one active DJ (patron-facing)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const venues = await prisma.venue.findMany({
      where: { djs: { some: { isActive: true } } },
      orderBy: { name: 'asc' },
      select: venueSelect,
    });
    const out = venues
      .map(flattenVenue)
      .map((v) => ({ ...v, djs: v.djs.filter((d) => d.isActive) }));
    res.json(out);
  } catch (e) {
    console.error('GET /venues error:', e);
    res.status(500).json({ error: 'Failed to fetch venues' });
  }
});

// POST /venues — create venue and link current DJ (DJ only)
router.post('/', requireDj, async (req: Request, res: Response) => {
  const djReq = req as DjRequest;
  try {
    const result = createVenueSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error.issues[0].message });
      return;
    }
    const { name, address } = result.data;

    const venue = await prisma.venue.create({
      data: {
        name,
        address: address || null,
        logoUrl: null,
      },
      select: { id: true },
    });
    await prisma.venueDJ.create({
      data: { venueId: venue.id, djId: djReq.djId },
    });
    const withDjs = await prisma.venue.findUnique({
      where: { id: venue.id },
      select: venueSelect,
    });
    if (!withDjs) {
      res.status(500).json({ error: 'Failed to create venue' });
      return;
    }
    res.status(201).json(flattenVenue(withDjs));
  } catch (e) {
    console.error('POST /venues error:', e);
    res.status(500).json({ error: 'Failed to create venue' });
  }
});

// PATCH /venues/:venueId — edit venue (DJ only, must be linked)
router.patch('/:venueId', requireDj, async (req: Request, res: Response) => {
  const djReq = req as DjRequest;
  try {
    const { venueId } = req.params;
    const result = updateVenueSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error.issues[0].message });
      return;
    }
    const link = await prisma.venueDJ.findUnique({
      where: { venueId_djId: { venueId, djId: djReq.djId } },
    });
    if (!link) {
      res.status(403).json({ error: 'You are not linked to this venue' });
      return;
    }
    const data: { name?: string; address?: string | null } = {};
    if (result.data.name !== undefined) data.name = result.data.name;
    if (result.data.address !== undefined) {
      data.address = result.data.address && result.data.address.length > 0 ? result.data.address : null;
    }
    const updated = await prisma.venue.update({
      where: { id: venueId },
      data,
      select: venueSelect,
    });
    res.json(flattenVenue(updated));
  } catch (e) {
    console.error('PATCH /venues/:venueId error:', e);
    res.status(500).json({ error: 'Failed to update venue' });
  }
});

// PATCH /venues/:venueId/active — toggle this DJ's active status at the venue
router.patch('/:venueId/active', requireDj, async (req: Request, res: Response) => {
  const djReq = req as DjRequest;
  try {
    const { venueId } = req.params;
    const result = setActiveSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error.issues[0].message });
      return;
    }
    const link = await prisma.venueDJ.findUnique({
      where: { venueId_djId: { venueId, djId: djReq.djId } },
    });
    if (!link) {
      res.status(403).json({ error: 'You are not linked to this venue' });
      return;
    }
    await prisma.venueDJ.update({
      where: { venueId_djId: { venueId, djId: djReq.djId } },
      data: { isActive: result.data.isActive },
    });
    const updated = await prisma.venue.findUnique({
      where: { id: venueId },
      select: venueSelect,
    });
    if (!updated) {
      res.status(404).json({ error: 'Venue not found' });
      return;
    }
    res.json(flattenVenue(updated));
  } catch (e) {
    console.error('PATCH /venues/:venueId/active error:', e);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// DELETE /venues/:venueId/link — unlink current DJ from venue
router.delete('/:venueId/link', requireDj, async (req: Request, res: Response) => {
  const djReq = req as DjRequest;
  try {
    const { venueId } = req.params;
    const link = await prisma.venueDJ.findUnique({
      where: { venueId_djId: { venueId, djId: djReq.djId } },
    });
    if (!link) {
      res.status(404).json({ error: 'You are not linked to this venue' });
      return;
    }
    await prisma.venueDJ.delete({
      where: { venueId_djId: { venueId, djId: djReq.djId } },
    });
    res.status(204).end();
  } catch (e) {
    console.error('DELETE /venues/:venueId/link error:', e);
    res.status(500).json({ error: 'Failed to unlink from venue' });
  }
});

// POST /venues/:venueId/link — link current DJ to existing venue (DJ only)
router.post('/:venueId/link', requireDj, async (req: Request, res: Response) => {
  const djReq = req as DjRequest;
  try {
    const { venueId } = req.params;
    const existing = await prisma.venue.findUnique({
      where: { id: venueId },
      select: venueSelect,
    });
    if (!existing) {
      res.status(404).json({ error: 'Venue not found' });
      return;
    }
    const already = await prisma.venueDJ.findUnique({
      where: { venueId_djId: { venueId, djId: djReq.djId } },
    });
    if (already) {
      res.status(409).json({ error: 'You are already linked to this venue' });
      return;
    }
    await prisma.venueDJ.create({
      data: { venueId, djId: djReq.djId },
    });
    const updated = await prisma.venue.findUnique({
      where: { id: venueId },
      select: venueSelect,
    });
    res.status(201).json(updated ? flattenVenue(updated) : flattenVenue(existing));
  } catch (e) {
    console.error('POST /venues/:venueId/link error:', e);
    res.status(500).json({ error: 'Failed to link to venue' });
  }
});

export default router;
