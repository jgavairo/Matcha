import { Request, Response } from 'express';
import path from 'path';
import { blockUser, unblockUser, addReport, updateUser, completeProfileUser, updateUserInterests, updatePassword, addImage, removeImage, setProfileImage, updateGeolocationConsent, recordView, getUserById, getLikedByUsers, getViewedByUsers, updateUserStatus, validateProfileCompletion, removeImageComplete, savePendingEmail, getUserByEmail } from '../models/userModel';
import { getMatchedUsers } from '../models/matchModel';
import { getIO } from '../config/socket';
import { createNotification } from '../models/notificationModel';
import { db } from '../utils/db';
import { EMAIL_REGEX, PASSWORD_REGEX } from '@shared/validation';
import { generateToken } from '../utils/jwt';
import { AuthController } from './authController';
import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';

const mapUserSummary = (u: any) => ({
    id: u.id,
    username: u.username,
    age: u.age,
    gender: u.gender,
    biography: u.biography || '',
    distance: Math.round(u.distance || 0),
    location: {
        city: u.city || '',
        // Removed lat/long for privacy
    },
    tags: u.tags || [],
    images: u.images || [],
    fameRating: u.fame_rating || 0,
    isOnline: u.is_online || false,
    lastConnection: u.last_connection || undefined
});

export class UserController {
    public updateProfile = async (req: Request, res: Response) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { tags, username, firstName, lastName, email, gender, sexualPreferences, biography, latitude, longitude, city, birthDate, statusId, geolocationConsent } = req.body;

            let updateMessage = 'Profile updated successfully';

            if (email) {
                const emailRegex = EMAIL_REGEX.source;
                if (!email.match(emailRegex)) {
                    return res.status(400).json({ error: 'Invalid email format' });
                }

                // Check if email is different from current
                const currentUser = await getUserById(userId);
                if (currentUser && currentUser.email !== email) {
                    
                    // Check if email is already taken by another user
                    const existingUser = await getUserByEmail(email);
                    if (existingUser) {
                        return res.status(400).json({ error: 'Email already in use' });
                    }

                    // Handle email change with verification
                    const token = uuidv4();
                    await savePendingEmail(userId, email, token);
                    
                    // Send verification email
                    const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}&type=email_change`;
                    
                    await AuthController.sendEmail({
                        to: email,
                        subject: 'Verify your new email address',
                        title: 'Verify your new email',
                        subtitle: 'Confirm your new email address',
                        message: 'You have requested to change your email address. Please click the button below to verify this new address.',
                        buttonText: 'Verify my email',
                        url: verificationLink,
                        logoCid: 'matcha-logo'
                    });
                    
                    updateMessage = 'Profile updated. Please check your new email to verify the change.';
                    // Remove email from data to update so it doesn't get updated immediately
                    // But we still update other fields
                }
            }

            // Update basic user info (exclude email if handled separately above, actually we pass 'email' but updateUser ignores it if we don't handle it right? 
            // Wait, updateUser extracts email from data. We should pass data without email if email changed.)
            
            const dataToUpdate = { username, firstName, lastName, gender, sexualPreferences, biography, latitude, longitude, city, birthDate, geolocationConsent };
            
            // Note: We don't update statusId here yet, we'll validate first
            await updateUser(userId, dataToUpdate);

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
            } else if (statusId !== undefined) {
                // Allow updating to other statuses without validation
                await updateUser(userId, { statusId });
            }

            res.status(200).json({ message: updateMessage });
        } catch (error: any) {
            if (error.message === 'Email already in use' || error.message === 'Username already taken') {
                return res.status(400).json({ error: error.message });
            }
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
            if (!newPassword || !newPassword.match(PASSWORD_REGEX)) {
                return res.status(400).json({ error: 'Password must contain at least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char' });
            }

            await updatePassword(userId, newPassword);

            res.status(200).json({ message: 'Password updated successfully' });
        } catch (error) {
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

            // Process image with Sharp for security
            if (req.file.mimetype.startsWith('image/')) {
                const { processImage, getOptimalFormat, validateImage } = await import('../utils/imageProcessor');
                const fs = await import('fs/promises');
                const uploadDir = process.env.UPLOADS_DIR || '/app/uploads';
                const originalPath = req.file.path;
                
                // Create a different temporary path to avoid input/output conflict
                const pathModule = await import('path');
                const originalExt = pathModule.extname(originalPath);
                const baseName = pathModule.basename(originalPath, originalExt);
                const tempPath = pathModule.join(uploadDir, `${baseName}.tmp.jpg`);
                const finalPath = pathModule.join(uploadDir, `${baseName}.jpg`);

                // Validate that it's a valid image
                const isValid = await validateImage(originalPath);
                if (!isValid) {
                    // Supprimer le fichier invalide
                    await fs.unlink(originalPath).catch(() => {});
                    return res.status(400).json({ error: 'Invalid image file' });
                }

                try {
                    // Process image (resize, convert, clean) to temporary file
                    await processImage(originalPath, tempPath, {
                        maxWidth: 1920,
                        maxHeight: 1920,
                        quality: 85,
                        format: getOptimalFormat(req.file.mimetype)
                    });

                    // Rename temporary file to final name
                    await fs.rename(tempPath, finalPath);
                    
                    // Update the filename to use the processed file
                    req.file.filename = pathModule.basename(finalPath);
                } catch (processError: any) {
                    // If processing fails, delete files and reject
                    await fs.unlink(originalPath).catch(() => {});
                    await fs.unlink(tempPath).catch(() => {});
                    await fs.unlink(finalPath).catch(() => {});
                    return res.status(400).json({ 
                        error: 'Invalid image file: ' + (processError.message || 'Unable to process image') 
                    });
                }
            }

            const image = await addImage(userId, req.file.filename);
            res.status(201).json(image);
        } catch (error: any) {
            if (req.file) {
                const fs = await import('fs/promises');
                await fs.unlink(req.file.path).catch(() => {});
            }
            const errorMessage = error.message || 'Internal server error';
            res.status(500).json({ error: errorMessage });
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
        } catch (error: any) {
            if (error.message && error.message.includes('You must have at least')) {
                return res.status(400).json({ error: error.message });
            }
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    public deletePhotoComplete = async (req: Request, res: Response) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const { url } = req.body;
            if (!url) {
                return res.status(400).json({ error: 'URL is required' });
            }
            await removeImageComplete(userId, url);
            res.status(200).json({ message: 'Photo deleted successfully' });
        }
        catch (error: any) {
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

            const isNewView = await recordView(viewerId, viewedId);

            if (isNewView) {
                // Notify viewed user
                const viewer = await getUserById(viewerId);
                if (viewer) {
                    const visitMsg = `${viewer.username} visited your profile.`;
                    const newNotification = await createNotification(viewedId, 'visit', visitMsg, viewerId);

                    const io = getIO();
                    io.to(`user_${viewedId}`).emit('notification', {
                        id: newNotification.id,
                        type: 'visit',
                        message: visitMsg,
                        senderId: viewerId,
                        senderUsername: viewer.username,
                        avatar: viewer.images[0],
                        time: newNotification.created_at
                    });
                }
            }

            res.status(200).json({ message: 'View recorded' });
        } catch (error) {
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
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    public getMatches = async (req: Request, res: Response) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const matches = await getMatchedUsers(userId);
            res.status(200).json(matches.map(mapUserSummary));
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    public getLikedBy = async (req: Request, res: Response) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const likedBy = await getLikedByUsers(userId);
            res.status(200).json(likedBy.map(mapUserSummary));
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    public getViewedBy = async (req: Request, res: Response) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const viewedBy = await getViewedByUsers(userId);
            res.status(200).json(viewedBy.map(mapUserSummary));
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    public completeProfile = async (req: Request, res: Response) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const currentUser = await getUserById(userId);
            if (!currentUser || currentUser.status_id !== 1) {
                return res.status(400).json({ 
                    error: 'User must be verified (status 1) to complete profile' 
                });
            }

            const { gender, sexualPreferences, biography, latitude, longitude, city, geolocationConsent, tags } = req.body;

            // Updates only the fields from the "complete-profile" wizard
            await completeProfileUser(userId, {
                gender,
                sexualPreferences,
                biography,
                latitude,
                longitude,
                city,
                geolocationConsent
            });

            if (tags && Array.isArray(tags) && tags.length > 0) {
                await updateUserInterests(userId, tags);
            }

            db.update('users', userId, { status_id: 2 });
            res.status(200).json({ message: 'Profile completed successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    public reportUser = async (req: Request, res: Response) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const { reportedId, reasons } = req.body;
            if (!reportedId || !reasons) {
                return res.status(400).json({ error: 'Reported ID and reason are required' });
            }
            const result = await addReport(userId, reportedId, reasons);
            if (result) {
                return res.status(200).json({ message: 'User reported successfully' });
            } else {
                return res.status(400).json({ error: 'User already reported' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    public blockUser = async (req: Request, res: Response) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const { blockedId } = req.body;
            if (!blockedId) {
                return res.status(400).json({ error: 'Blocked ID is required' });
            }
            const result: any = await blockUser(userId, blockedId);
            
            if (result && result.success) {
                if (result.conversationId) {
                    const io = getIO();
                    
                    // Emit system message to both users
                    if (result.message) {
                        io.to(`user_${userId}`).emit('chat_message', result.message);
                        io.to(`user_${blockedId}`).emit('chat_message', result.message);
                    }

                    // Update conversation status for both users
                    io.to(`user_${userId}`).emit('conversation_status_update', { 
                        conversationId: result.conversationId, 
                        is_active: false 
                    });
                    io.to(`user_${blockedId}`).emit('conversation_status_update', { 
                        conversationId: result.conversationId, 
                        is_active: false 
                    });
                }

                return res.status(200).json({ message: 'User blocked successfully' });
            } else {
                return res.status(400).json({ error: 'User already blocked' });
            }
        }
        catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    public unblockUser = async (req: Request, res: Response) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const { unblockedId } = req.body;
            if (!unblockedId) {
                return res.status(400).json({ error: 'Unblocked ID is required' });
            }
            const result = await unblockUser(userId, unblockedId);
            if (result) {
                return res.status(200).json({ message: 'User unblocked successfully' });
            } else {
                return res.status(400).json({ error: 'User not blocked' });
            }
        }
        catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}
