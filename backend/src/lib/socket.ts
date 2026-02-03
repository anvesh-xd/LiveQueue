import { Server as SocketIOServer } from 'socket.io';

let io: SocketIOServer | null = null;

export function setIO(socketServer: SocketIOServer): void {
  io = socketServer;
}

export function getIO(): SocketIOServer | null {
  return io;
}
