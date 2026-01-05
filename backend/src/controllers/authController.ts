import { Request, Response } from 'express';
import { LoginFormData, RegisterFormData } from '../types/forms';
import { 
    createUser, 
    loginUser, 
    getUserById, 
    getUserByEmail,
    getLikedByUsers,
    getViewedByUsers,
    getMatchedUsers,
    getUserByVerificationToken,
    updateUserStatus,
    generateVerificationToken,
    updatePassword
} from '../models/userModel';
import { generateToken } from '../utils/jwt';
import nodemailer, { Transporter } from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';


export class AuthController {

    async register(req: Request, res: Response) {
        const registerData: RegisterFormData = req.body;
        try {
            const user = await createUser(registerData);
            const transporter: Transporter = nodemailer.createTransport({
                service: 'gmail',
                from: 'matcha@noreply.com',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD,
                },
            });
            const mailOptions = {
                from: 'noreply@matcha.com',
                to: user.email,
                subject: 'Welcome to Matcha',
                html: `<div>
                    <img src="${process.env.FRONTEND_URL}/logo.png" alt="Matcha Logo" />
                    <h1>Welcome to Matcha</h1>
                    <p>Thank you for registering on Matcha. Please click the link below to verify your email:</p>
                    <a href="${process.env.FRONTEND_URL}/verify-email?token=${user.verificationToken}">Verify email</a>
                </div>`,
            };
            await transporter.sendMail(mailOptions);
            res.status(201).json({ message: 'User created successfully, please check your email for verification' });
        } catch (error: any) {
            if (error.code === '23505') {
                res.status(400).json({ error: 'Account already exists' });
                return;
            } 
            console.error('Error creating user:', error);
            res.status(500).json({ error: 'Failed to create user' });
        }
    }


    async login(req: Request, res: Response) {
        const loginData: LoginFormData = req.body;
        try {
            const user = await loginUser(loginData);
            if (!user) {
                res.status(401).json({ error: 'Invalid username or password' });
                return;
            }
            if (user.status === 'not_verified') {
                // Si le token est expiré, en générer un nouveau et l'envoyer
                if (user.tokenExpired) {
                    const { token: newToken, email } = await generateVerificationToken(user.id);
                    
                    // Envoyer le nouvel email de vérification
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
                        subject: 'New verification link - Matcha',
                        html: `<div>
                            <h1>Your verification link has expired</h1>
                            <p>Here is a new link to verify your email (valid for 15 minutes):</p>
                            <a href="${process.env.FRONTEND_URL}/verify-email?token=${newToken}">Verify email</a>
                        </div>`,
                    };
                    await transporter.sendMail(mailOptions);
                    
                    res.status(401).json({ error: 'Verification link expired. A new verification email has been sent.' });
                    return;
                }
                
                res.status(401).json({ error: 'User not verified, please check your email for verification' });
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

            const likedBy = await getLikedByUsers(user.id);
            const viewedBy = await getViewedByUsers(user.id);
            const matches = await getMatchedUsers(user.id);

            const mapUserSummary = (u: any) => ({
                id: u.id,
                username: u.username,
                age: u.age,
                gender: u.gender,
                biography: u.biography || '',
                distance: 0, // Can't calculate distance here easily without viewer coords, but for lists it's fine
                location: {
                    city: u.city || '',
                    latitude: u.latitude,
                    longitude: u.longitude
                },
                tags: u.tags || [],
                images: u.images || [],
                fameRating: u.fame_rating || 0
            });

            const formattedUser = {
                id: user.id,
                username: user.username,
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email,
                statusId: user.status_id,
                age: user.age,
                birthDate: user.birth_date ? new Date(user.birth_date).toISOString().split('T')[0] : "",
                gender: user.gender,
                sexualPreferences: user.sexual_preferences || [],
                biography: user.biography || "",
                tags: user.tags || [],
                images: user.images || [],
                fameRating: user.fame_rating || 0,
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
                likedBy: likedBy.map(mapUserSummary),
                viewedBy: viewedBy.map(mapUserSummary),
                matches: matches.map(mapUserSummary),
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
            
            const { token } = await generateVerificationToken(user.id, 15);
            
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
                subject: 'Reset your password - Matcha',
                html: `<div>
                    <h1>Reset your password</h1>
                    <p>Click the link to reset your password (valid for 15 minutes):</p>
                    <a href="${process.env.FRONTEND_URL}/reset-password?token=${token}">Reset password</a>
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

    async verifyEmail(req: Request, res: Response) {
        const { token } = req.query;
        if (!token || typeof token !== 'string') {
            res.status(400).json({ error: 'Token is required' });
            return;
        }
        try {
            const user = await getUserByVerificationToken(token as string);
            
            if ('error' in user) {
                if (user.error === 'invalid_token') {
                    res.status(400).json({ error: 'Invalid verification token' });
                    return;
                }
                if (user.error === 'token_expired') {
                    res.status(400).json({ error: 'Verification token has expired. Please register again.' });
                    return;
                }
            }
            
            if (user.status === 1) {
                res.status(400).json({ error: 'Email already verified' });
                return;
            }
            
            await updateUserStatus(user.id, 1);
            res.status(200).json({ message: 'Email verified successfully' });
        } catch (error) {
            console.error('Error in verifyEmail:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async resetPassword(req: Request, res: Response) {
        const { token, newPassword } = req.body;
        
        if (!token || !newPassword) {
            res.status(400).json({ error: 'Token and new password are required' });
            return;
        }

        try {
            const user = await getUserByVerificationToken(token);
            
            if ('error' in user) {
                if (user.error === 'invalid_token') {
                    res.status(400).json({ error: 'Invalid or expired token' });
                    return;
                }
                if (user.error === 'token_expired') {
                    res.status(400).json({ error: 'Token has expired. Please request a new password reset.' });
                    return;
                }
            }

            await updatePassword(user.id, newPassword);
            
            if (user.status === 0) {
                await updateUserStatus(user.id, 1);
                res.status(200).json({ message: 'Password reset successfully. Your email has also been verified!' });
                return;
            }
            
            await updateUserStatus(user.id, user.status);
            
            res.status(200).json({ message: 'Password reset successfully' });
        } catch (error) {
            console.error('Error in resetPassword:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async checkToken(req: Request, res: Response) {
        const { token } = req.query;
        
        if (!token || typeof token !== 'string') {
            res.status(400).json({ valid: false, error: 'Token is required' });
            return;
        }

        try {
            const user = await getUserByVerificationToken(token);
            
            if ('error' in user) {
                res.status(400).json({ valid: false, error: user.error });
                return;
            }
            
            res.status(200).json({ valid: true });
        } catch (error) {
            console.error('Error in checkToken:', error);
            res.status(500).json({ valid: false, error: 'Internal server error' });
        }
    }
}
