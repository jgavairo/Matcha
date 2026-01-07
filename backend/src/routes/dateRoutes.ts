import { Router } from 'express';
import * as dateController from '../controllers/dateController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.post('/', authMiddleware, dateController.proposeDate);
router.get('/:targetUserId', authMiddleware, dateController.getDates);
router.put('/:id/status', authMiddleware, dateController.updateDateStatus);
router.put('/:id/modify', authMiddleware, dateController.modifyDate);
router.delete('/:id', authMiddleware, dateController.cancelDate);

export default router;
