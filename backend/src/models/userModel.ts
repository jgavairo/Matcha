import { LoginFormData, RegisterFormData } from '../types/forms';
import { pool } from '../config/database';

export const createUser = async (user: RegisterFormData) => {
    const query = `
    INSERT INTO users (email, username, first_name, last_name, birth_date, password)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
    `;
    const values = [user.email, user.username, user.firstName, user.lastName, user.birthDate, user.password];
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
    SELECT email, password FROM users WHERE email = $1
    `;
        const values = [user.email];
        const result = await pool.query(query, values);
        if (result.rows.length === 0) {
            console.error('Invalid email');
            return false;
        }
        if (result.rows[0].password !== user.password) {
            console.error('Invalid password');
            return false;
        }
        return true;
    } catch (error) {
        console.error('Error logging in user:', error);
        throw error;
    }
};