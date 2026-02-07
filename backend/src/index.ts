import 'dotenv/config';
import http from 'http';
import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import { Server as SocketIOServer } from 'socket.io';
import authRoutes from './routes/auth';
import venuesRoutes from './routes/venues';
import requestsRoutes from './routes/requests';
import deezerRoutes from './routes/deezer';
import { setIO } from './lib/socket';

const app = express();
const PORT = process.env.PORT || 3001;
const server = http.createServer(app);

// Critical: Crash if JWT_SECRET is not set
if (!process.env.JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is required for security');
}
const JWT_SECRET = process.env.JWT_SECRET;

const app = express();
const PORT = process.env.PORT || 3001;
const server = http.createServer(app);

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.deezer.com"],
    },
  },
}));

// CORS — allow frontend to call API
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));

// Rate limiting - general API limit
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth attempts per window
  message: { error: 'Too many authentication attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(generalLimiter);

// Socket.io — allow frontend origin
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});
setIO(io);

// Socket.io authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication required'));
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { sub: string; type: 'patron' | 'dj' };
    socket.data.userId = decoded.sub;
    socket.data.userType = decoded.type;
    next();
  } catch {
    next(new Error('Invalid or expired token'));
  }
});

io.on('connection', (socket) => {
  const userId = socket.data.userId;
  const userType = socket.data.userType;

  socket.on('join', (data: { venueId?: string; userId?: string; djId?: string }) => {
    // Patrons can only join their own user room and venue rooms
    if (userType === 'patron') {
      if (data.userId === userId) {
        socket.join(`user:${data.userId}`);
      }
      if (data.venueId) {
        socket.join(`venue:${data.venueId}`);
      }
    }
    // DJs can only join their own DJ room and venue rooms
    else if (userType === 'dj') {
      if (data.djId === userId) {
        socket.join(`dj:${data.djId}`);
      }
      if (data.venueId) {
        socket.join(`venue:${data.venueId}`);
      }
    }
  });
});

// Middleware
app.use(express.json());

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// Routes
app.use('/auth', authLimiter, authRoutes);
app.use('/venues', venuesRoutes);
app.use('/requests', requestsRoutes);
app.use('/deezer', deezerRoutes);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔌 Socket.io ready`);
});
