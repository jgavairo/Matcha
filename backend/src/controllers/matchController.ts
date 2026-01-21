import { Request, Response } from 'express';
import { searchUsers, likeUser, dislikeUser, unlikeUser, getUserById, isUserBlocked } from '../models/userModel';
import { createNotification } from '../models/notificationModel';
import { getIO } from '../config/socket';

export class MatchController {
    public like = async (req: Request, res: Response) => {
        try {
            const likerId = req.user?.id;
            const likedId = parseInt(req.params.id);

            if (!likerId) return res.status(401).json({ error: 'Unauthorized' });
            if (isNaN(likedId)) return res.status(400).json({ error: 'Invalid user ID' });

            if (likerId === likedId) {
                return res.status(400).json({ error: 'Cannot interact with yourself' });
            }

            if (await isUserBlocked(likerId, likedId)) {
                return res.status(403).json({ error: 'Interaction not allowed with blocked user' });
            }

            const result = await likeUser(likerId, likedId);
            
            // Allow notifications if it is a new like/match. 
            // Only skip if IS NOT new like (already liked/matched state)
            if (!result.isNewLike) {
                 return res.status(200).json({ message: 'User already liked', isMatch: result.isMatch });
            }

            const liker = await getUserById(likerId);

            if (result.isMatch && result.message) {
                const io = getIO();
                io.to(`user_${likerId}`).emit('chat_message', result.message);
                io.to(`user_${likedId}`).emit('chat_message', result.message);
                
                if (result.conversationId) {
                    io.to(`user_${likerId}`).emit('conversation_status_update', { conversationId: result.conversationId, is_active: true });
                    io.to(`user_${likedId}`).emit('conversation_status_update', { conversationId: result.conversationId, is_active: true });
                }

                // Match Notifications
                const likedUser = await getUserById(likedId);
                
                const matchMsg1 = `You matched with ${likedUser.username}!`;
                const notif1 = await createNotification(likerId, 'match', matchMsg1, likedId);
                io.to(`user_${likerId}`).emit('notification', {
                    id: notif1.id,
                    type: 'match',
                    message: matchMsg1,
                    senderId: likedId,
                    senderUsername: likedUser.username,
                    avatar: likedUser.images[0],
                    time: notif1.created_at
                });

                const matchMsg2 = `You matched with ${liker.username}!`;
                const notif2 = await createNotification(likedId, 'match', matchMsg2, likerId);
                io.to(`user_${likedId}`).emit('notification', {
                    id: notif2.id,
                    type: 'match',
                    message: matchMsg2,
                    senderId: likerId,
                    senderUsername: liker.username,
                    avatar: liker.images[0],
                    time: notif2.created_at
                });

            } else {
                // Like Notification
                if (liker) {
                    const likeMsg = `${liker.username} liked your profile.`;
                    const notif = await createNotification(likedId, 'like', likeMsg, likerId);

                    const io = getIO();
                    io.to(`user_${likedId}`).emit('notification', {
                        id: notif.id,
                        type: 'like',
                        message: likeMsg,
                        senderId: likerId,
                        senderUsername: liker.username,
                        avatar: liker.images[0],
                        time: notif.created_at
                    });
                }
            }

            res.status(200).json({ message: 'User liked', isMatch: result.isMatch });
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    public dislike = async (req: Request, res: Response) => {
        try {
            const dislikerId = req.user?.id;
            const dislikedId = parseInt(req.params.id);

            if (!dislikerId) return res.status(401).json({ error: 'Unauthorized' });
            if (isNaN(dislikedId)) return res.status(400).json({ error: 'Invalid user ID' });

            if (dislikerId === dislikedId) {
                return res.status(400).json({ error: 'Cannot interact with yourself' });
            }

            if (await isUserBlocked(dislikerId, dislikedId)) {
                return res.status(403).json({ error: 'Interaction not allowed with blocked user' });
            }

            const result = await dislikeUser(dislikerId, dislikedId);

            if (result.message && result.conversationId) {
                const io = getIO();
                io.to(`user_${dislikerId}`).emit('chat_message', result.message);
                io.to(`user_${dislikedId}`).emit('chat_message', result.message);
                io.to(`user_${dislikerId}`).emit('conversation_status_update', { conversationId: result.conversationId, is_active: false });
                io.to(`user_${dislikedId}`).emit('conversation_status_update', { conversationId: result.conversationId, is_active: false });
            }

            res.status(200).json({ message: 'User disliked' });
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    public unlike = async (req: Request, res: Response) => {
        try {
            const likerId = req.user?.id;
            const likedId = parseInt(req.params.id);

            if (!likerId) return res.status(401).json({ error: 'Unauthorized' });
            if (isNaN(likedId)) return res.status(400).json({ error: 'Invalid user ID' });

            if (likerId === likedId) {
                return res.status(400).json({ error: 'Cannot interact with yourself' });
            }

            if (await isUserBlocked(likerId, likedId)) {
                return res.status(403).json({ error: 'Interaction not allowed with blocked user' });
            }

            const result = await unlikeUser(likerId, likedId);
            const liker = await getUserById(likerId);

            if (result.message && result.conversationId) {
                const io = getIO();
                io.to(`user_${likerId}`).emit('chat_message', result.message);
                io.to(`user_${likedId}`).emit('chat_message', result.message);
                io.to(`user_${likerId}`).emit('conversation_status_update', { conversationId: result.conversationId, is_active: false });
                io.to(`user_${likedId}`).emit('conversation_status_update', { conversationId: result.conversationId, is_active: false });
            }

            // Unlike Notification
            if (liker) {
                const unlikeMsg = `${liker.username} unliked you.`;
                const notif = await createNotification(likedId, 'unlike', unlikeMsg, likerId);

                const io = getIO();
                io.to(`user_${likedId}`).emit('notification', {
                    id: notif.id,
                    type: 'unlike',
                    message: unlikeMsg,
                    senderId: likerId,
                    senderUsername: liker.username,
                    avatar: liker.images[0],
                    time: notif.created_at
                });
            }

            res.status(200).json({ message: 'User unliked' });
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    public search = async (req: Request, res: Response) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { 
                ageRange, 
                distanceRange, 
                fameRange, 
                minCommonTags, 
                tags, 
                gender,
                sexualPreference,
                location, 
                locationCoords,
                sortBy, 
                sortOrder,
                includeInteracted = false,
                cursor = null,
                limit = 12,
                mode = 'discover'
            } = req.body;

            const filters = {
                ageRange,
                distanceRange,
                fameRange,
                minCommonTags,
                tags,
                gender,
                sexualPreference,
                location,
                locationCoords,
                sortBy,
                sortOrder,
                includeInteracted,
                mode
            };

            const result = await searchUsers(userId, filters, cursor, limit);
            
            res.status(200).json({
                data: result.users,
                total: result.total,
                cursor: result.nextCursor,
                limit
            });
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    };
}
