import { pool } from '../config/database';

export const getAllTags = async () => {
    const query = 'SELECT name FROM interests ORDER BY name ASC';
    try {
        const result = await pool.query(query);
        return result.rows.map(row => row.name);
    } catch (error) {
        console.error('Error getting all tags:', error);
        throw error;
    }
};
