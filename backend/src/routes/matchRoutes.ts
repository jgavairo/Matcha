import { Router } from 'express';
import { MatchController } from '../controllers/matchController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const matchController = new MatchController();

router.post('/search', authMiddleware, matchController.search);
router.post('/:id/like', authMiddleware, matchController.like);
router.post('/:id/dislike', authMiddleware, matchController.dislike);
router.delete('/:id/like', authMiddleware, matchController.unlike);

export default router;
