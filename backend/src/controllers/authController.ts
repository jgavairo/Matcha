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
import path from 'path';
import fs from 'fs/promises';


export class AuthController {

    private getTransporter(): Transporter {
        return nodemailer.createTransport({
            service: 'gmail',
            from: 'matcha@noreply.com',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
    }

    private async sendEmail(params: {
        to: string;
        subject: string;
        title: string;
        subtitle: string;
        message: string;
        buttonText: string;
        url: string;
        logoCid: string;
    }): Promise<void> {
        const { to, subject, title, subtitle, message, buttonText, url, logoCid } = params;
        const transporter = this.getTransporter();
        const logoPath = path.resolve(__dirname, '../../assets/logo.png');
        
        // Déterminer le chemin du template selon l'environnement
        // En dev (ts-node): __dirname = src/controllers → ../templates/email.html
        // En prod (compilé): __dirname = dist/controllers → ../../src/templates/email.html
        let templatePath = path.resolve(__dirname, '../templates/email.html');
        let htmlTemplate: string;
        
        try {
            // Essayer de lire le template depuis le chemin relatif (dev)
            htmlTemplate = await fs.readFile(templatePath, 'utf-8');
        } catch (error: any) {
            // Si le fichier n'existe pas, essayer depuis src/ (prod compilé)
            templatePath = path.resolve(__dirname, '../../src/templates/email.html');
            try {
                htmlTemplate = await fs.readFile(templatePath, 'utf-8');
            } catch (error2: any) {
                // Dernier essai depuis la racine du projet
                templatePath = path.resolve(process.cwd(), 'src/templates/email.html');
                htmlTemplate = await fs.readFile(templatePath, 'utf-8');
            }
        }

        console.log('Using email template from:', templatePath);
        console.log('Template length before replacement:', htmlTemplate.length);
        console.log('Template preview (first 200 chars):', htmlTemplate.substring(0, 200));

        try {
            // Remplacer les variables dans le template
            htmlTemplate = htmlTemplate
                .replace(/{{SUBJECT}}/g, subject)
                .replace(/{{TITLE}}/g, title)
                .replace(/{{SUBTITLE}}/g, subtitle)
                .replace(/{{MESSAGE}}/g, message)
                .replace(/{{BUTTON_TEXT}}/g, buttonText)
                .replace(/{{URL}}/g, url)
                .replace(/{{LOGO_CID}}/g, logoCid)
                .replace(/{{YEAR}}/g, new Date().getFullYear().toString());

            console.log('Template length after replacement:', htmlTemplate.length);
            console.log('Template contains position:relative:', htmlTemplate.includes('position:relative'));
            console.log('Template contains LOGO_CID:', htmlTemplate.includes('{{LOGO_CID}}'));
            
            // Vérifier que le template a bien été lu (doit contenir du HTML)
            if (!htmlTemplate.includes('<!DOCTYPE html>') && !htmlTemplate.includes('<html')) {
                console.error('WARNING: Template does not appear to be valid HTML!');
                console.error('Template content:', htmlTemplate.substring(0, 500));
            }

            const mailOptions = {
                from: 'Matcha <noreply@matcha.com>',
                to,
                subject,
                html: htmlTemplate,
                attachments: [
                    {
                        filename: 'logo.png',
                        path: logoPath,
                        cid: logoCid
                    }
                ]
            };

            await transporter.sendMail(mailOptions);
        } catch (error) {
            console.error('Error reading email template:', error);
            console.error('Template path:', templatePath);
            throw error;
        }
    }

    register = async (req: Request, res: Response) => {
        const registerData: RegisterFormData = req.body;
        try {
            const user = await createUser(registerData);

            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            const verifyUrl = `${frontendUrl}/verify-email?token=${user.verificationToken}`;

            await this.sendEmail({
                to: user.email,
                subject: 'Welcome to Matcha – Verify your account',
                title: `Bienvenue sur Matcha, ${user.username} !`,
                subtitle: 'One last click to join the community 💕',
                message: 'Thank you for registering on <strong>Matcha</strong>. To secure your account and start discovering new profiles, we need to verify your email address first.',
                buttonText: 'Verify my email',
                url: verifyUrl,
                logoCid: 'matcha-logo'
            });

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


    login = async (req: Request, res: Response) => {
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
                    
                    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
                    const verifyUrl = `${frontendUrl}/verify-email?token=${newToken}`;

                    await this.sendEmail({
                        to: email,
                        subject: 'New verification link – Matcha',
                        title: 'New verification link',
                        subtitle: 'Your previous link has expired',
                        message: 'Your previous verification link has expired. Here is a new link to verify your email address (valid for <strong>15 minutes</strong>).',
                        buttonText: 'Verify my email',
                        url: verifyUrl,
                        logoCid: 'matcha-logo-renew'
                    });
                    
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

    logout = async (req: Request, res: Response) => {
        res.clearCookie('token');
        res.status(200).json({ message: 'Logout successful' });
    }

    me = async (req: Request, res: Response) => {
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
                likesCount: parseInt(user.likes_count || '0'),
                viewsCount: parseInt(user.views_count || '0'),
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

    forgotPassword = async (req: Request, res: Response) => {
        const { email } = req.body;
        try {
            const user = await getUserByEmail(email);
            if (!user) {
                res.status(404).json({ error: 'User not found' });
                return;
            }
            
            const { token } = await generateVerificationToken(user.id, 15);
            
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

            await this.sendEmail({
                to: email,
                subject: 'Reset your password – Matcha',
                title: 'Reset your password',
                subtitle: 'You requested to reset your password',
                message: 'Click the button below to choose a new password. This link is valid for <strong>15 minutes</strong>. If you didn\'t request a password reset, you can safely ignore this email.',
                buttonText: 'Reset my password',
                url: resetUrl,
                logoCid: 'matcha-logo-reset'
            });

            res.status(200).json({ message: 'Email sent successfully' });
        }
        catch (error) {
            console.error('Error in forgotPassword:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    verifyEmail = async (req: Request, res: Response) => {
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

    resetPassword = async (req: Request, res: Response) => {
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

    checkToken = async (req: Request, res: Response) => {
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
