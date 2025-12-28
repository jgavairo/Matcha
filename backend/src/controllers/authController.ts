import { Request, Response } from 'express';
import { LoginFormData, RegisterFormData } from '../types/forms';
import { createUser, loginUser } from '../models/userModel';
import { generateToken } from '../utils/jwt';

export class AuthController {

    async register(req: Request, res: Response) {
        const registerData: RegisterFormData = req.body;
        try {
            const user = await createUser(registerData);
            res.status(201).json(user);
        } catch (error: any) {
            if (error.code === '23505') {
                res.status(400).json({ error: 'Account already exists' });
                return
            } 
            res.status(500).json({ error: 'Failed to create user' });
            console.error('Error creating user:', error);
        }
    }


    async login(req: Request, res: Response) {
        const loginData: LoginFormData = req.body;
        try {
            const user = await loginUser(loginData);
            if (!user) {
                res.status(401).json({ error: 'Invalid email or password' });
                return;
            }
            const token = generateToken({ id: user.id }, loginData.remember);
            
            const maxAge = loginData.remember 
                ? 30 * 24 * 60 * 60 * 1000
                : 1 * 60 * 60 * 1000;

            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
                maxAge
            });

            res.status(200).json({ message: 'Login successful' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to login user' });
            console.error('Error logging in user:', error);
        }   
    }

    async logout(req: Request, res: Response) {
        res.clearCookie('token');
        res.status(200).json({ message: 'Logout successful' });
    }

    async me(req: Request, res: Response) {
        res.status(200).json({ message: 'User authenticated' });
    }
}