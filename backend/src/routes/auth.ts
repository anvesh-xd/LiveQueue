import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { randomBytes } from 'crypto';
import { prisma } from '../lib/prisma';

const router = Router();

// Critical: Crash if JWT_SECRET is not set (no insecure fallback)
if (!process.env.JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is required for security');
}
const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = 10;
const ACCESS_TOKEN_EXPIRY = '15m'; // Short-lived access tokens
const REFRESH_TOKEN_EXPIRY_DAYS = 30; // Long-lived refresh tokens

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email format').max(255, 'Email too long'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password too long'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').trim(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format').max(255),
  password: z.string().min(1, 'Password is required'),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// Helper: Generate refresh token
async function createRefreshToken(userId: string, type: 'patron' | 'dj'): Promise<string> {
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);
  
  await prisma.refreshToken.create({
    data: {
      token,
      userId: type === 'patron' ? userId : null,
      djId: type === 'dj' ? userId : null,
      type,
      expiresAt,
    },
  });
  
  return token;
}

// POST /auth/register — register patron (User)
router.post('/register', async (req: Request, res: Response) => {
  try {
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error.issues[0].message });
      return;
    }
    const { email, password, name } = result.data;
    
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
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );
    const refreshToken = await createRefreshToken(user.id, 'patron');
    res.status(201).json({ user, token, refreshToken });
  } catch (e) {
    console.error('Auth register error:', e);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /auth/login — login patron (User)
router.post('/login', async (req: Request, res: Response) => {
  try {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error.issues[0].message });
      return;
    }
    const { email, password } = result.data;
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }
    const token = jwt.sign(
      { sub: user.id, type: 'patron' as const },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );
    const refreshToken = await createRefreshToken(user.id, 'patron');
    res.json({
      user: { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt },
      token,
      refreshToken,
    });
  } catch (e) {
    console.error('Auth login error:', e);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /auth/login-dj — login DJ
router.post('/login-dj', async (req: Request, res: Response) => {
  try {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error.issues[0].message });
      return;
    }
    const { email, password } = result.data;
    
    const dj = await prisma.dJ.findUnique({ where: { email } });
    if (!dj || !bcrypt.compareSync(password, dj.passwordHash)) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }
    const token = jwt.sign(
      { sub: dj.id, type: 'dj' as const },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );
    const refreshToken = await createRefreshToken(dj.id, 'dj');
    res.json({
      user: { id: dj.id, email: dj.email, name: dj.name, createdAt: dj.createdAt },
      token,
      refreshToken,
    });
  } catch (e) {
    console.error('Auth login-dj error:', e);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /auth/refresh — refresh access token using refresh token
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const result = refreshSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error.issues[0].message });
      return;
    }
    const { refreshToken: token } = result.data;
    
    // Find and validate refresh token
    const refreshToken = await prisma.refreshToken.findUnique({
      where: { token },
      include: {
        user: { select: { id: true, email: true, name: true, createdAt: true } },
        dj: { select: { id: true, email: true, name: true, createdAt: true } },
      },
    });
    
    if (!refreshToken) {
      res.status(401).json({ error: 'Invalid refresh token' });
      return;
    }
    
    if (refreshToken.expiresAt < new Date()) {
      // Clean up expired token
      await prisma.refreshToken.delete({ where: { id: refreshToken.id } });
      res.status(401).json({ error: 'Refresh token expired' });
      return;
    }
    
    // Generate new access token
    const userId = refreshToken.type === 'patron' ? refreshToken.userId! : refreshToken.djId!;
    const user = refreshToken.type === 'patron' ? refreshToken.user! : refreshToken.dj!;
    
    const accessToken = jwt.sign(
      { sub: userId, type: refreshToken.type },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );
    
    res.json({ token: accessToken, user });
  } catch (e) {
    console.error('Auth refresh error:', e);
    res.status(500).json({ error: 'Token refresh failed' });
  }
});

export default router;
