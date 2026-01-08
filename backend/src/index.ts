import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { initializeSocket } from './config/socket';
import { AuthController } from './controllers/authController';
import { authMiddleware } from './middlewares/authMiddleware';
import { authLimiter, registerLimiter, passwordResetLimiter } from './middlewares/rateLimiter';
import chatRoutes from './routes/chatRoutes';
import tagRoutes from './routes/tagRoutes';
import userRoutes from './routes/userRoutes';
import matchRoutes from './routes/matchRoutes';
import dateRoutes from './routes/dateRoutes';
import { validateRegister } from './middlewares/validation';
import { handleValidationErrors } from './middlewares/validationHandler';
import { UserController } from './controllers/userController';    


// initializing ================================================================

const authController = new AuthController();
const userController = new UserController();
const app = express();
const port = process.env.PORT || 5000;
const uploadDir = process.env.UPLOADS_DIR || '/app/uploads';

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
app.use('/uploads', express.static(uploadDir));




// Routes =====================================================================


// Authentication Routes ------------------------------------------------------

app.post('/auth/register', registerLimiter, validateRegister, handleValidationErrors, authController.register);

app.post('/auth/login', authLimiter, authController.login);

app.get('/auth/me', authMiddleware, authController.me);

app.post('/auth/logout', authMiddleware, authController.logout);

app.post('/auth/forgot-password', passwordResetLimiter, authController.forgotPassword);

app.get('/auth/verify-email', authController.verifyEmail);

app.post('/auth/reset-password', passwordResetLimiter, authController.resetPassword);

app.get('/auth/check-token', authController.checkToken);

// User Routes ----------------------------------------------------------------

app.use('/users', userRoutes);

app.post('/report', authMiddleware, userController.reportUser);

app.post('/block', authMiddleware, userController.blockUser);

app.post('/unblock', authMiddleware, userController.unblockUser);

// Match Routes ---------------------------------------------------------------

app.use('/matches', matchRoutes);

// Chat Routes ----------------------------------------------------------------


// Tag Routes -----------------------------------------------------------------

app.use('/tags', tagRoutes);
app.use('/chat', chatRoutes);
app.use('/dates', dateRoutes);



// =============================================================================

httpServer.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
