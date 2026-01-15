import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import * as notificationController from '../controllers/notificationController';

const router = Router();

router.get('/', authMiddleware, notificationController.getUserNotifications);
router.put('/:id/read', authMiddleware, notificationController.markAsRead);
router.put('/read-all', authMiddleware, notificationController.markAllAsRead);
router.delete('/:id', authMiddleware, notificationController.removeNotification);
router.delete('/', authMiddleware, notificationController.clearNotifications);

export default router;
