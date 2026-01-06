import { Router } from 'express';
import * as chatController from '../controllers/chatController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { upload } from '../utils/fileUpload';

const router = Router();

router.use(authMiddleware);

router.post('/upload', upload.array('files', 10), chatController.uploadFiles);


router.get('/conversations', chatController.getConversations);
router.get('/conversations/:id/messages', chatController.getMessages);
router.post('/conversations/:id/messages', chatController.sendMessage);
router.post('/conversations/:id/read', chatController.markAsRead);

// Test route to create a match
router.post('/matches', chatController.createMatch);

export default router;
