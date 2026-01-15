import { db } from '../utils/db';

export const getAllTags = async () => {
    try {
        const rows = await db.findAll('interests', {}, ['name'], 'name', 'ASC');
        return rows.map((row: any) => row.name);
    } catch (error) {
        throw error;
    }
};
