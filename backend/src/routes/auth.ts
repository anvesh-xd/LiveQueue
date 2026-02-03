import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-in-production';
const SALT_ROUNDS = 10;

// POST /auth/register — register patron (User)
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      res.status(400).json({ error: 'Email, password, and name are required' });
      return;
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }
    const passwordHash = bcrypt.hashSync(password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: { email, passwordHash, name },
      select: { id: true, email: true, name: true, createdAt: true },
    });
    const token = jwt.sign(
      { sub: user.id, type: 'patron' as const },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.status(201).json({ user, token });
  } catch (e) {
    console.error('Auth register error:', e);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /auth/login — login patron (User)
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }
    const token = jwt.sign(
      { sub: user.id, type: 'patron' as const },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({
      user: { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt },
      token,
    });
  } catch (e) {
    console.error('Auth login error:', e);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /auth/login-dj — login DJ
router.post('/login-dj', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }
    const dj = await prisma.dJ.findUnique({ where: { email } });
    if (!dj || !bcrypt.compareSync(password, dj.passwordHash)) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }
    const token = jwt.sign(
      { sub: dj.id, type: 'dj' as const },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({
      user: { id: dj.id, email: dj.email, name: dj.name, createdAt: dj.createdAt },
      token,
    });
  } catch (e) {
    console.error('Auth login-dj error:', e);
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
