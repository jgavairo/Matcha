import { Request, Response } from 'express';
import { updateUser, updateUserInterests, updatePassword, addImage, removeImage, setProfileImage, updateGeolocationConsent } from '../models/userModel';

export class UserController {
    public updateProfile = async (req: Request, res: Response) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { tags, firstName, lastName, email, gender, sexualPreferences, biography, latitude, longitude, city } = req.body;

            // Basic validation
            if (!firstName || !lastName || !email || !gender || !sexualPreferences) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ error: 'Invalid email format' });
            }

            // Update basic user info
            await updateUser(userId, { firstName, lastName, email, gender, sexualPreferences, biography, latitude, longitude, city });

            // Update interests if provided
            if (tags) {
                await updateUserInterests(userId, tags);
            }

            res.status(200).json({ message: 'Profile updated successfully' });
        } catch (error) {
            console.error('Error updating profile:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    public changePassword = async (req: Request, res: Response) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { newPassword } = req.body;
            if (!newPassword || newPassword.length < 6) {
                return res.status(400).json({ error: 'Password must be at least 6 characters long' });
            }

            await updatePassword(userId, newPassword);

            res.status(200).json({ message: 'Password updated successfully' });
        } catch (error) {
            console.error('Error changing password:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    public uploadPhoto = async (req: Request, res: Response) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            const image = await addImage(userId, req.file.filename);
            res.status(201).json(image);
        } catch (error) {
            console.error('Error uploading photo:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    public deletePhoto = async (req: Request, res: Response) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { url } = req.body;
            if (!url) {
                return res.status(400).json({ error: 'URL is required' });
            }

            await removeImage(userId, url);
            res.status(200).json({ message: 'Photo deleted successfully' });
        } catch (error) {
            console.error('Error deleting photo:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    public setProfilePhoto = async (req: Request, res: Response) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { url } = req.body;
            if (!url) {
                return res.status(400).json({ error: 'URL is required' });
            }

            await setProfileImage(userId, url);
            res.status(200).json({ message: 'Profile photo updated successfully' });
        } catch (error) {
            console.error('Error setting profile photo:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    public updateConsent = async (req: Request, res: Response) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { consent } = req.body;
            if (typeof consent !== 'boolean') {
                return res.status(400).json({ error: 'Consent must be a boolean' });
            }

            await updateGeolocationConsent(userId, consent);
            res.status(200).json({ message: 'Consent updated successfully' });
        } catch (error) {
            console.error('Error updating consent:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };
}
