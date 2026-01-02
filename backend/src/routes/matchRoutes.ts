import { Router } from 'express';
import { MatchController } from '../controllers/matchController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const matchController = new MatchController();

router.post('/search', authMiddleware, matchController.search);

export default router;
