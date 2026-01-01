import { Request, Response } from 'express';
import { LoginFormData, RegisterFormData } from '../types/forms';
import { createUser, loginUser, getUserById } from '../models/userModel';
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
        try {
            // @ts-ignore
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            const user = await getUserById(userId);
            if (!user) {
                res.status(404).json({ error: 'User not found' });
                return;
            }

            // Map database fields to frontend CurrentUser interface
            const formattedUser = {
                id: user.id,
                username: user.username,
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email,
                age: user.age,
                gender: user.gender,
                sexualPreferences: "bi", // TODO: Map from user.sexual_preferences
                biography: user.biography || "",
                tags: user.tags || [],
                images: user.images || [],
                fameRating: 100, // TODO: Implement fame rating
                distance: 0,
                location: {
                    city: user.city || "Unknown",
                    latitude: user.latitude,
                    longitude: user.longitude
                },
                geolocationConsent: user.geolocation_consent,
                isOnline: true,
                lastConnection: "Now",
                hasLikedYou: false,
                isMatch: false,
                likedBy: [],
                viewedBy: [],
                matches: [],
                blockedUsers: []
            };

            res.status(200).json(formattedUser);
        } catch (error) {
            console.error('Error in me:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}
