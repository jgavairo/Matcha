// config/socket.ts

import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { verifyToken } from '../utils/jwt';
import { db } from '../utils/db';
import * as matchModel from '../models/matchModel';
import * as chatModel from '../models/chatModel';
import * as userModel from '../models/userModel';

let io: Server;

const activeCalls = new Map<number, { partnerId: number, startTime: number }>();

const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
};

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
      // Handle active call disconnection
      if (activeCalls.has(userId)) {
          const { partnerId, startTime } = activeCalls.get(userId)!;
          const duration = Date.now() - startTime;
          const durationStr = formatDuration(duration);

          // Remove from map for both
          activeCalls.delete(userId);
          activeCalls.delete(partnerId);

          // Notify partner
          io.to(`user_${partnerId}`).emit('call_ended', { from: userId });

          // Log system message
          try {
              const conversationId = await chatModel.getConversationIdByUsers(userId, partnerId);
              if (conversationId) {
                  const content = `Call ended. Duration: ${durationStr}`;
                  const message = await chatModel.createMessage(conversationId, null, content, 'system');
                  io.to(`user_${partnerId}`).emit('chat_message', message);
              }
          } catch (err) {
              console.error("Error logging call duration on disconnect", err);
          }
      }

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
      
      // Track call start
      const startTime = Date.now();
      activeCalls.set(userId, { partnerId: data.to, startTime });
      activeCalls.set(data.to, { partnerId: userId, startTime });
    });

    socket.on('ice_candidate', (data: { to: number; candidate: any }) => {
        io.to(`user_${data.to}`).emit('ice_candidate_incoming',  data.candidate);
    });

    socket.on('call_declined', async (data: { to: number }) => {
        io.to(`user_${data.to}`).emit('call_declined');

        // Log missed call
        try {
            const conversationId = await chatModel.getConversationIdByUsers(userId, data.to);
            if (conversationId) {
                const user = await userModel.getUserById(userId);
                const username = user?.username || 'Unknown';
                const message = await chatModel.createMessage(conversationId, null, `Call missed by ${username}`, 'system');
                io.to(`user_${userId}`).emit('chat_message', message);
                io.to(`user_${data.to}`).emit('chat_message', message);
            }
        } catch (err) {
             console.error("Error logging missed call (declined)", err);
        }
    });

    socket.on('call_ended', async (data: { to: number }) => {
        io.to(`user_${data.to}`).emit('call_ended');

        // Calculate and log duration
        if (activeCalls.has(userId)) {
            const { startTime } = activeCalls.get(userId)!;
            const duration = Date.now() - startTime;
            const durationStr = formatDuration(duration);

            activeCalls.delete(userId);
            activeCalls.delete(data.to);

            try {
                const conversationId = await chatModel.getConversationIdByUsers(userId, data.to);
                if (conversationId) {
                    const content = `Call ended. Duration: ${durationStr}`;
                    const message = await chatModel.createMessage(conversationId, null, content, 'system');
                    
                    io.to(`user_${userId}`).emit('chat_message', message);
                    io.to(`user_${data.to}`).emit('chat_message', message);
                }
            } catch (err) {
                 console.error("Error logging call duration", err);
            }
        } else {
            // Call cancelled before answer -> Missed call
             try {
                const conversationId = await chatModel.getConversationIdByUsers(userId, data.to);
                if (conversationId) {
                    const user = await userModel.getUserById(data.to);
                    const username = user?.username || 'Unknown';
                    const message = await chatModel.createMessage(conversationId, null, `Call missed by ${username}`, 'system');
                    io.to(`user_${userId}`).emit('chat_message', message);
                    io.to(`user_${data.to}`).emit('chat_message', message);
                }
            } catch (err) {
                 console.error("Error logging missed call (cancelled)", err);
            }
        }
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