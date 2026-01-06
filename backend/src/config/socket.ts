// config/socket.ts

import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { verifyToken } from '../utils/jwt';
import { db } from '../utils/db';
import * as matchModel from '../models/matchModel';

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

  io.on('connection', async (socket) => {
    // @ts-ignore
    const userId = socket.userId;
    
    // Update user status to online
    try {
        await db.query('UPDATE users SET is_online = true WHERE id = $1', [userId]);
        
        // Notify only engaged users
        const friendIds = await matchModel.getMatchedUserIds(userId);
        friendIds.forEach(friendId => {
            io.to(`user_${friendId}`).emit('user_status_change', { userId, isOnline: true });
        });
    } catch (error) {
        console.error(`Failed to update user status for ${userId}`, error);
    }

    socket.join(`user_${userId}`);

    socket.on('disconnect', async () => {
      // Update user status to offline
      try {
          const now = new Date();
          await db.query('UPDATE users SET is_online = false, last_connection = $1 WHERE id = $2', [now, userId]);
          
          // Notify only engaged users
          const friendIds = await matchModel.getMatchedUserIds(userId);
          friendIds.forEach(friendId => {
              io.to(`user_${friendId}`).emit('user_status_change', { userId, isOnline: false, lastConnection: now });
          });
      } catch (error) {
          console.error(`Failed to update user status for ${userId}`, error);
      }
    });

    // WebRTC Signaling
    socket.on('call_user', (data: { userToCall: number; signalData: any; from: number; name: string; avatar: string }) => {
      io.to(`user_${data.userToCall}`).emit('call_incoming', { 
        signal: data.signalData, 
        from: data.from,
        name: data.name,
        avatar: data.avatar
      });
    });

    socket.on('answer_call', (data: { to: number; signal: any }) => {
      io.to(`user_${data.to}`).emit('call_accepted', data.signal);
    });

    socket.on('ice_candidate', (data: { to: number; candidate: any }) => {
        io.to(`user_${data.to}`).emit('ice_candidate_incoming',  data.candidate);
    });

    socket.on('call_declined', (data: { to: number }) => {
        io.to(`user_${data.to}`).emit('call_declined');
    });

    socket.on('call_ended', (data: { to: number }) => {
        io.to(`user_${data.to}`).emit('call_ended');
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