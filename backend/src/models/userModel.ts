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

export const getUserById = async (id: number) => {
    const query = `
        SELECT 
            u.id, u.email, u.username, u.first_name, u.last_name, u.birth_date, u.biography, u.status_id,
            u.latitude, u.longitude,
            EXTRACT(YEAR FROM AGE(u.birth_date)) as age,
            g.gender,
            u.sexual_preferences,
            COALESCE(array_agg(DISTINCT i.url) FILTER (WHERE i.url IS NOT NULL), '{}') as images,
            COALESCE(array_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL), '{}') as tags
        FROM users u
        LEFT JOIN genders g ON u.gender_id = g.id
        LEFT JOIN images i ON u.id = i.user_id
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
