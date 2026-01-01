import { Router } from 'express';
import { TagController } from '../controllers/tagController';

const router = Router();
const tagController = new TagController();

router.get('/', tagController.getTags);

export default router;
