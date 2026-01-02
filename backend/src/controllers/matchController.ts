import { Request, Response } from 'express';
import { searchUsers } from '../models/userModel';

export class MatchController {
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
                sortOrder
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
