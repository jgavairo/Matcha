import express, { Request, Response } from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { AuthController } from './controllers/authController';

dotenv.config();
const authController = new AuthController();

const app = express();
const port = process.env.PORT || 5000;

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST"],
  credentials: true,
}));

app.use(express.json());

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: 5432,
});

// Routes =====================================================================

// Authentication Routes ---------------------------------

app.post('/auth/register', authController.register);

// =============================================================================

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });

  socket.on('chat_message', (msg) => {
    console.log('message: ' + msg);
    io.emit('chat_message', msg);
  });
});

// Use httpServer.listen instead of app.listen
httpServer.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
