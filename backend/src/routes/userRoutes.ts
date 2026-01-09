import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { completeProfileValidation, validateUpdateProfile } from '../middlewares/validation';
import { handleValidationErrors } from '../middlewares/validationHandler';
// Importe l'instance configurée au lieu de la recréer ici
import { upload } from '../utils/fileUpload'; 

const router = Router();
const userController = new UserController();

// Route pour compléter le profil
router.put(
    '/profile/complete',
    authMiddleware,
    completeProfileValidation,
    handleValidationErrors,
    userController.completeProfile
);

router.put('/profile', authMiddleware, validateUpdateProfile, handleValidationErrors, userController.updateProfile);
router.put('/password', authMiddleware, userController.changePassword);

// Utilise maintenant l'import 'upload'
router.post('/photos', authMiddleware, upload.single('image'), userController.uploadPhoto);

router.delete('/photos', authMiddleware, userController.deletePhoto);
router.delete('/photos/complete', authMiddleware, userController.deletePhotoComplete);
router.put('/photos/profile', authMiddleware, userController.setProfilePhoto);
router.put('/consent', authMiddleware, userController.updateConsent);
router.post('/view/:id', authMiddleware, userController.recordView);

router.get('/matches', authMiddleware, userController.getMatches);
router.get('/liked-by', authMiddleware, userController.getLikedBy);
router.get('/viewed-by', authMiddleware, userController.getViewedBy);

router.get('/:id', authMiddleware, userController.getUser);

export default router;