import { Request, Response } from 'express';
import { updateUser, updateUserInterests, updatePassword, addImage, removeImage, setProfileImage, updateGeolocationConsent, recordView, getUserById, updateUserStatus, validateProfileCompletion } from '../models/userModel';

export class UserController {
    public updateProfile = async (req: Request, res: Response) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { tags, username, firstName, lastName, email, gender, sexualPreferences, biography, latitude, longitude, city, birthDate, statusId, geolocationConsent } = req.body;

            // Email validation if provided
            if (email) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    return res.status(400).json({ error: 'Invalid email format' });
                }
            }

            // Update basic user info (only if fields are provided)
            // Note: We don't update statusId here yet, we'll validate first
            await updateUser(userId, { username, firstName, lastName, email, gender, sexualPreferences, biography, latitude, longitude, city, birthDate, geolocationConsent });

            // Update interests if provided
            if (tags && tags.length > 0) {
                await updateUserInterests(userId, tags);
            }

            // If trying to set statusId to 2 (profile completed), validate first
            if (statusId === 2) {
                const validation = await validateProfileCompletion(userId);
                if (!validation.isValid) {
                    return res.status(400).json({ 
                        error: 'Profile is not complete',
                        missingFields: validation.missingFields
                    });
                }
                // Profile is valid, now update statusId
                await updateUser(userId, { statusId: 2 });
            } else if (statusId !== undefined) {
                // Allow updating to other statuses without validation
                await updateUser(userId, { statusId });
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

    public recordView = async (req: Request, res: Response) => {
        try {
            const viewerId = req.user?.id;
            const viewedId = parseInt(req.params.id);

            if (!viewerId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            if (isNaN(viewedId)) {
                return res.status(400).json({ error: 'Invalid user ID' });
            }

            await recordView(viewerId, viewedId);
            res.status(200).json({ message: 'View recorded' });
        } catch (error) {
            console.error('Error recording view:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    public getUser = async (req: Request, res: Response) => {
        try {
            const userId = parseInt(req.params.id);
            const currentUserId = req.user?.id;

            if (isNaN(userId)) {
                return res.status(400).json({ error: 'Invalid user ID' });
            }

            const user = await getUserById(userId, currentUserId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.status(200).json(user);
        } catch (error) {
            console.error('Error getting user:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };
}
