import { Request, Response } from 'express';
import { updateUser, updateUserInterests, updatePassword } from '../models/userModel';

export class UserController {
    public updateProfile = async (req: Request, res: Response) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { tags, ...userData } = req.body;

            // Update basic user info
            await updateUser(userId, userData);

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
}
