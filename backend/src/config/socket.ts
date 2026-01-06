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

    // WebRTC Signaling
    socket.on('call_user', (data: { userToCall: number; signalData: any; from: number; name: string; avatar: string }) => {
      console.log(`[Signaling] Call from ${data.from} to ${data.userToCall}`);
      io.to(`user_${data.userToCall}`).emit('call_incoming', { 
        signal: data.signalData, 
        from: data.from,
        name: data.name,
        avatar: data.avatar
      });
      console.log(`[Signaling] call_incoming emitted to user_${data.userToCall}`);
    });

    socket.on('answer_call', (data: { to: number; signal: any }) => {
      console.log(`[Signaling] Call answered by ${userId} to ${data.to}`);
      io.to(`user_${data.to}`).emit('call_accepted', data.signal);
      console.log(`[Signaling] call_accepted emitted to user_${data.to}`);
    });

    socket.on('ice_candidate', (data: { to: number; candidate: any }) => {
        console.log(`[Signaling] ICE candidate from ${userId} to ${data.to}`);
        io.to(`user_${data.to}`).emit('ice_candidate_incoming',  data.candidate);
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