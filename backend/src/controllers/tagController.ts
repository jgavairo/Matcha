import { Request, Response } from 'express';
import { getAllTags } from '../models/tagModel';

export class TagController {
    async getTags(req: Request, res: Response) {
        try {
            const tags = await getAllTags();
            res.status(200).json(tags);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch tags' });
        }
    }
}
