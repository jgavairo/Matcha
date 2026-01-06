import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { completeProfileValidation } from '../middlewares/validation';
import { handleValidationErrors } from '../middlewares/validationHandler';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();
const userController = new UserController();

// Configure multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Route pour compléter le profil (tous les champs obligatoires)
router.put('/profile/complete', 
    authMiddleware, 
    completeProfileValidation, 
    handleValidationErrors, 
    userController.updateProfile
);

// Route pour mettre à jour le profil (champs optionnels)
router.put('/profile', authMiddleware, userController.updateProfile);
router.put('/password', authMiddleware, userController.changePassword);

router.post('/photos', authMiddleware, upload.single('image'), userController.uploadPhoto);
router.delete('/photos', authMiddleware, userController.deletePhoto);
router.put('/photos/profile', authMiddleware, userController.setProfilePhoto);
router.put('/consent', authMiddleware, userController.updateConsent);
router.post('/view/:id', authMiddleware, userController.recordView);

router.get('/matches', authMiddleware, userController.getMatches);
router.get('/liked-by', authMiddleware, userController.getLikedBy);
router.get('/viewed-by', authMiddleware, userController.getViewedBy);

router.get('/:id', authMiddleware, userController.getUser);

export default router;
