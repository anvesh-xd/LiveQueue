import 'dotenv/config';
import http from 'http';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { Server as SocketIOServer } from 'socket.io';
import authRoutes from './routes/auth';
import venuesRoutes from './routes/venues';
import requestsRoutes from './routes/requests';
import { setIO } from './lib/socket';

const app = express();
const PORT = process.env.PORT || 3001;
const server = http.createServer(app);

// CORS — allow frontend to call API
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));

// Socket.io — allow frontend origin
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});
setIO(io);

io.on('connection', (socket) => {
  socket.on('join', (data: { venueId?: string; userId?: string; djId?: string }) => {
    if (data.venueId) socket.join(`venue:${data.venueId}`);
    if (data.userId) socket.join(`user:${data.userId}`);
    if (data.djId) socket.join(`dj:${data.djId}`);
  });
});

// Middleware
app.use(express.json());

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// Routes
app.use('/auth', authRoutes);
app.use('/venues', venuesRoutes);
app.use('/requests', requestsRoutes);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔌 Socket.io ready`);
});
