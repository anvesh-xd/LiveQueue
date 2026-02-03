import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

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
    // Flatten to { id, name, address, djs: [{ id, name }] }
    const result = venues.map((v) => ({
      id: v.id,
      name: v.name,
      address: v.address,
      djs: v.djs.map((d) => ({ id: d.dj.id, name: d.dj.name })),
    }));
    res.json(result);
  } catch (e) {
    console.error('GET /venues error:', e);
    res.status(500).json({ error: 'Failed to fetch venues' });
  }
});

export default router;
