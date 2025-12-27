import { Request, Response } from 'express';
import { LoginFormData, RegisterFormData } from '../types/forms';
import { createUser, loginUser } from '../models/userModel';

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
            if (user === false) {
                res.status(401).json({ error: 'Invalid email or password' });
                return;
            }
            res.status(200).json({ message: 'Login successful' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to login user' });
            console.error('Error logging in user:', error);
        }   
    }
}
