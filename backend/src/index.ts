import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { initializeSocket } from './config/socket';
import { AuthController } from './controllers/authController';

// initializing ================================================================

dotenv.config();
const authController = new AuthController();

const app = express();
const port = process.env.PORT || 5000;

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.io
const io = initializeSocket(httpServer);

app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST"],
  credentials: true,
}));

app.use(express.json());

// Routes =====================================================================


// Authentication Routes ------------------------------------------------------

app.post('/auth/register', authController.register);

app.post('/auth/login', authController.login);



// =============================================================================

httpServer.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
