import { Request, Response } from 'express';
import { searchUsers, likeUser, dislikeUser, unlikeUser } from '../models/userModel';

export class MatchController {
    public like = async (req: Request, res: Response) => {
        try {
            const likerId = req.user?.id;
            const likedId = parseInt(req.params.id);

            if (!likerId) return res.status(401).json({ error: 'Unauthorized' });
            if (isNaN(likedId)) return res.status(400).json({ error: 'Invalid user ID' });

            const result = await likeUser(likerId, likedId);
            res.status(200).json({ message: 'User liked', isMatch: result.isMatch });
        } catch (error) {
            console.error('Error liking user:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    public dislike = async (req: Request, res: Response) => {
        try {
            const dislikerId = req.user?.id;
            const dislikedId = parseInt(req.params.id);

            if (!dislikerId) return res.status(401).json({ error: 'Unauthorized' });
            if (isNaN(dislikedId)) return res.status(400).json({ error: 'Invalid user ID' });

            await dislikeUser(dislikerId, dislikedId);
            res.status(200).json({ message: 'User disliked' });
        } catch (error) {
            console.error('Error disliking user:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    public unlike = async (req: Request, res: Response) => {
        try {
            const likerId = req.user?.id;
            const likedId = parseInt(req.params.id);

            if (!likerId) return res.status(401).json({ error: 'Unauthorized' });
            if (isNaN(likedId)) return res.status(400).json({ error: 'Invalid user ID' });

            await unlikeUser(likerId, likedId);
            res.status(200).json({ message: 'User unliked' });
        } catch (error) {
            console.error('Error unliking user:', error);
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
                page = 1,
                limit = 12
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
                includeInteracted
            };

            const result = await searchUsers(userId, filters, page, limit);
            
            res.status(200).json({
                data: result.users,
                total: result.total,
                page,
                limit
            });
        } catch (error) {
            console.error('Error searching users:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };
}
