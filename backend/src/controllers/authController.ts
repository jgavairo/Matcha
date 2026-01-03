import { Request, Response } from 'express';
import { LoginFormData, RegisterFormData } from '../types/forms';
import { createUser, loginUser, getUserById, getUserByEmail } from '../models/userModel';
import { generateToken } from '../utils/jwt';
import nodemailer, { Transporter } from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';


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
            // const genderIdMap: { [key: number]: string } = { 1: 'male', 2: 'female', 3: 'other' };
            // const sexualPreferences = (user.sexual_preferences || []).map((id: number) => genderIdMap[id] || 'other');

            const formattedUser = {
                id: user.id,
                username: user.username,
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email,
                age: user.age,
                birthDate: user.birth_date ? new Date(user.birth_date).toISOString().split('T')[0] : "",
                gender: user.gender,
                sexualPreferences: user.sexual_preferences || [],
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

    async forgotPassword(req: Request, res: Response) {
        const { email } = req.body;
        try {
            const user = await getUserByEmail(email);
            if (!user) {
                res.status(404).json({ error: 'User not found' });
                return;
            }
            const token = uuidv4();
            const transporter: Transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD,
                },
            });
            const mailOptions = {
                from: 'noreply@matcha.com',
                to: email,
                subject: 'Reset your password',
                html: `<div>
                    <h1>Reset your password</h1>
                    <p>Click the link to reset your password: <a href="${process.env.FRONTEND_URL}/reset-password?token=${token}">Reset password</a></p>
                </div>`,
            };
            await transporter.sendMail(mailOptions);
            res.status(200).json({ message: 'Email sent successfully' });
        }
        catch (error) {
            console.error('Error in forgotPassword:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}
