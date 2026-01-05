// config/socket.ts

import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { verifyToken } from '../utils/jwt';

let io: Server;

export const initializeSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.use((socket, next) => {
    let token = socket.handshake.auth.token;

    if (!token && socket.handshake.headers.cookie) {
      const cookies = socket.handshake.headers.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {} as any);
      token = cookies.token;
    }

    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return next(new Error('Authentication error'));
    }

    // @ts-ignore
    socket.userId = decoded.id;
    next();
  });

  io.on('connection', (socket) => {
    // @ts-ignore
    const userId = socket.userId;
    console.log(`User connected: ${userId} (${socket.id})`);
    
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined room user_${userId}`);

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${userId}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};