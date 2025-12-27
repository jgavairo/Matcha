// config/socket.ts

import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';

export const initializeSocket = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });

    socket.on('chat_message', (msg) => {
      console.log('message:', msg);
      io.emit('chat_message', msg);
    });
  });

  return io;
};