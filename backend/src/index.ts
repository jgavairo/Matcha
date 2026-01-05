import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { initializeSocket } from './config/socket';
import { AuthController } from './controllers/authController';
import { authMiddleware } from './middlewares/authMiddleware';
import chatRoutes from './routes/chatRoutes';
import tagRoutes from './routes/tagRoutes';
import userRoutes from './routes/userRoutes';
import matchRoutes from './routes/matchRoutes';

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
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));




// Routes =====================================================================


// Authentication Routes ------------------------------------------------------

app.post('/auth/register', authController.register);

app.post('/auth/login', authController.login);

app.get('/auth/me', authMiddleware, authController.me);

app.post('/auth/logout', authMiddleware, authController.logout);

app.post('/auth/forgot-password', authController.forgotPassword);

app.get('/auth/verify-email', authController.verifyEmail);

app.post('/auth/reset-password', authController.resetPassword);
// User Routes ----------------------------------------------------------------

app.use('/users', userRoutes);

// Match Routes ---------------------------------------------------------------

app.use('/matches', matchRoutes);

// Chat Routes ----------------------------------------------------------------


// Tag Routes -----------------------------------------------------------------

app.use('/tags', tagRoutes);
app.use('/chat', chatRoutes);



// =============================================================================

httpServer.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
