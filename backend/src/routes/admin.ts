import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Middleware to verify admin secret
function adminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const adminSecret = process.env.ADMIN_SECRET;

  if (!adminSecret) {
    console.error('ADMIN_SECRET is not configured');
    res.status(500).json({ error: 'Server configuration error' });
    return;
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const token = authHeader.substring(7);
  if (token !== adminSecret) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  next();
}

// Generate a random 8-character alphanumeric code
function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed ambiguous chars
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// POST /admin/invite-codes - Generate new invite code
router.post('/invite-codes', adminAuth, async (req: Request, res: Response) => {
  try {
    const { label } = req.body;
    let code = generateCode();
    let attempts = 0;
    const maxAttempts = 10;

    // Ensure code is unique
    while (attempts < maxAttempts) {
      const existing = await prisma.inviteCode.findUnique({ where: { code } });
      if (!existing) break;
      code = generateCode();
      attempts++;
    }

    if (attempts === maxAttempts) {
      res.status(500).json({ error: 'Failed to generate unique code' });
      return;
    }

    const inviteCode = await prisma.inviteCode.create({
      data: { 
        code,
        label: label || null,
      },
    });

    res.json({ 
      code: inviteCode.code, 
      id: inviteCode.id, 
      label: inviteCode.label,
      createdAt: inviteCode.createdAt 
    });
  } catch (e) {
    console.error('Error creating invite code:', e);
    res.status(500).json({ error: 'Failed to create invite code' });
  }
});

// GET /admin/invite-codes - List all invite codes
router.get('/invite-codes', adminAuth, async (req: Request, res: Response) => {
  try {
    const codes = await prisma.inviteCode.findMany({
      include: {
        usedByDj: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(codes);
  } catch (e) {
    console.error('Error fetching invite codes:', e);
    res.status(500).json({ error: 'Failed to fetch invite codes' });
  }
});

export default router;
