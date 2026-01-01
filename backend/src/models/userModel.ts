import { LoginFormData, RegisterFormData } from '../types/forms';
import { pool } from '../config/database';
import bcrypt from 'bcrypt';

export const createUser = async (user: RegisterFormData) => {
    const query = `
    INSERT INTO users (email, username, first_name, last_name, birth_date, password)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
    `;
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const values = [user.email, user.username, user.firstName, user.lastName, user.birthDate, hashedPassword];
    try {
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
};

export const loginUser = async (user: LoginFormData) => {
    try {
    const query = `
    SELECT id, email, password FROM users WHERE email = $1
    `;
        const values = [user.email];
        const result = await pool.query(query, values);
        if (result.rows.length === 0) {
            console.error('Invalid email');
            return null;
        }
        const isValidPassword = await bcrypt.compare(user.password, result.rows[0].password);
        if (!isValidPassword) {
            console.error('Invalid password');
            return null;
        }
        return { id: result.rows[0].id };
    } catch (error) {
        console.error('Error logging in user:', error);
        throw error;
    }
};

export const updateUser = async (id: number, data: any) => {
    const { firstName, lastName, email, gender, sexualPreferences, biography, latitude, longitude, city } = data;
    
    // Map gender string to ID
    const genderMap: { [key: string]: number } = { 'male': 1, 'female': 2, 'other': 3 };
    const genderId = genderMap[gender] || null;

    // Map sexual preferences string to IDs array
    let targetGenderIds: number[] = [];
    if (gender === 'male') {
        if (sexualPreferences === 'hetero') targetGenderIds = [2];
        else if (sexualPreferences === 'homo') targetGenderIds = [1];
        else if (sexualPreferences === 'bi') targetGenderIds = [1, 2];
    } else if (gender === 'female') {
        if (sexualPreferences === 'hetero') targetGenderIds = [1];
        else if (sexualPreferences === 'homo') targetGenderIds = [2];
        else if (sexualPreferences === 'bi') targetGenderIds = [1, 2];
    } else {
        // For 'other', let's assume bi for now or handle differently
        targetGenderIds = [1, 2, 3];
    }

    const query = `
        UPDATE users 
        SET first_name = $1, last_name = $2, email = $3, gender_id = $4, sexual_preferences = $5, biography = $6, latitude = $7, longitude = $8, city = $9
        WHERE id = $10
        RETURNING *
    `;
    const values = [firstName, lastName, email, genderId, targetGenderIds, biography, latitude, longitude, city, id];
    
    try {
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
};

export const updateUserInterests = async (userId: number, tags: string[]) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // 1. Remove existing interests
        await client.query('DELETE FROM user_interests WHERE user_id = $1', [userId]);

        // 2. Add new interests
        // First ensure tags exist in interests table (optional, but good for consistency)
        // For now, assuming tags come from the predefined list which exists.
        
        // Get IDs for the tags
        if (tags.length > 0) {
            const tagQuery = `SELECT id FROM interests WHERE name = ANY($1)`;
            const tagResult = await client.query(tagQuery, [tags]);
            const tagIds = tagResult.rows.map(row => row.id);

            // Insert into user_interests
            if (tagIds.length > 0) {
                const values = tagIds.map((tagId, index) => `($1, $${index + 2})`).join(',');
                const insertQuery = `INSERT INTO user_interests (user_id, interest_id) VALUES ${values}`;
                await client.query(insertQuery, [userId, ...tagIds]);
            }
        }

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

export const updatePassword = async (userId: number, newPassword: string) => {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const query = 'UPDATE users SET password = $1 WHERE id = $2';
    await pool.query(query, [hashedPassword, userId]);
};

export const addImage = async (userId: number, filename: string) => {
    const url = `http://localhost:5000/uploads/${filename}`;
    const query = 'INSERT INTO images (user_id, url, is_profile_picture) VALUES ($1, $2, (SELECT COUNT(*) = 0 FROM images WHERE user_id = $1)) RETURNING *';
    const result = await pool.query(query, [userId, url]);
    return result.rows[0];
};

export const removeImage = async (userId: number, url: string) => {
    const query = 'DELETE FROM images WHERE user_id = $1 AND url = $2';
    await pool.query(query, [userId, url]);
};

export const setProfileImage = async (userId: number, url: string) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query('UPDATE images SET is_profile_picture = FALSE WHERE user_id = $1', [userId]);
        await client.query('UPDATE images SET is_profile_picture = TRUE WHERE user_id = $1 AND url = $2', [userId, url]);
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

export const getUserById = async (id: number) => {
    const query = `
        SELECT 
            u.id, u.email, u.username, u.first_name, u.last_name, u.birth_date, u.biography, u.status_id,
            u.latitude, u.longitude, u.city, u.geolocation_consent,
            EXTRACT(YEAR FROM AGE(u.birth_date)) as age,
            g.gender,
            u.sexual_preferences,
            (
                SELECT COALESCE(array_agg(url ORDER BY is_profile_picture DESC, created_at ASC), '{}')
                FROM images 
                WHERE user_id = u.id
            ) as images,
            COALESCE(array_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL), '{}') as tags
        FROM users u
        LEFT JOIN genders g ON u.gender_id = g.id
        LEFT JOIN user_interests ui ON u.id = ui.user_id
        LEFT JOIN interests t ON ui.interest_id = t.id
        WHERE u.id = $1
        GROUP BY u.id, g.gender
    `;
    const values = [id];
    try {
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error('Error getting user by id:', error);
        throw error;
    }
};

export const updateGeolocationConsent = async (userId: number, consent: boolean) => {
    const query = 'UPDATE users SET geolocation_consent = $1 WHERE id = $2';
    await pool.query(query, [consent, userId]);
};
