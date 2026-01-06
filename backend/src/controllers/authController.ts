import { Request, Response } from 'express';
import { LoginFormData, RegisterFormData } from '../types/forms';
import { 
    createUser, 
    loginUser, 
    getUserById, 
    getUserByEmail,
    getLikedByUsers,
    getViewedByUsers,
    getUserByVerificationToken,
    updateUserStatus,
    generateVerificationToken,
    updatePassword
} from '../models/userModel';
import { getMatchedUsers } from '../models/matchModel';
import { generateToken } from '../utils/jwt';
import nodemailer, { Transporter } from 'nodemailer';
import path from 'path';
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

            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            const logoCid = 'matcha-logo';
            // __dirname = /app/src/controllers → logo copié dans /app/assets/logo.png
            const logoPath = path.resolve(__dirname, '../../assets/logo.png');
            const verifyUrl = `${frontendUrl}/verify-email?token=${user.verificationToken}`;

            const mailOptions = {
                from: 'Matcha <noreply@matcha.com>',
                to: user.email,
                subject: 'Welcome to Matcha – Verify your account',
                html: `
                <!DOCTYPE html>
                <html lang="en">
                  <head>
                    <meta charset="UTF-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <title>Welcome to Matcha</title>
                  </head>
                  <body style="margin:0;padding:0;background-color:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;padding:32px 0;">
                      <tr>
                        <td align="center">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.08);">
                            <tr>
                              <td style="padding:32px 32px 16px 32px;background:linear-gradient(135deg,#ec4899,#db2777);text-align:center;">
                                <div style="display:inline-block;width:140px;height:140px;background-color:#fdf2f8;border-radius:50%;box-shadow:0 4px 12px rgba(0,0,0,0.15);padding:10px;margin-bottom:16px;">
                                  <img src="cid:${logoCid}" alt="Matcha" style="max-width:120px;height:auto;display:block;position:relative;margin:0auto;top:-3pt;left:6pt;"/>
                                </div>
                                <h1 style="margin:0;font-size:26px;line-height:1.3;color:#ffffff;">Bienvenue sur Matcha, ${user.username} !</h1>
                                <p style="margin:12px 0 0 0;font-size:14px;color:#fde7f3;">
                                  One last click to join the community 💕
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding:28px 32px 8px 32px;">
                                <p style="margin:0 0 16px 0;font-size:15px;color:#111827;">
                                  Thank you for registering on <strong>Matcha</strong>. To secure your account and start discovering new profiles,
                                  we need to verify your email address first.
                                </p>
                                <p style="margin:0 0 24px 0;font-size:15px;color:#374151;">
                                  Click the button below to verify your account&nbsp;:
                                </p>
                                <div style="text-align:center;margin:0 0 28px 0;">
                                  <a href="${verifyUrl}"
                                     style="display:inline-block;background:linear-gradient(135deg,#ec4899,#db2777);color:#ffffff;text-decoration:none;
                                            padding:12px 28px;border-radius:999px;font-size:15px;font-weight:600;">
                                    Verify my email
                                  </a>
                                </div>
                                <p style="margin:0 0 8px 0;font-size:13px;color:#6b7280;">
                                  If the button doesn't work, copy and paste this link in your browser&nbsp;:
                                </p>
                                <p style="margin:0;font-size:12px;color:#9ca3af;word-break:break-all;">
                                  <a href="${verifyUrl}" style="color:#ec4899;text-decoration:underline;">${verifyUrl}</a>
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding:16px 32px 24px 32px;border-top:1px solid #f3f4f6;">
                                <p style="margin:0 0 4px 0;font-size:12px;color:#9ca3af;">
                                  This email was sent automatically, please do not reply to it.
                                </p>
                                <p style="margin:0;font-size:12px;color:#9ca3af;">
                                  © ${new Date().getFullYear()} Matcha. All rights reserved.
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </body>
                </html>
                `,
                attachments: [
                    {
                        filename: 'logo.png',
                        path: logoPath,
                        cid: logoCid
                    }
                ]
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
                        from: 'matcha@noreply.com',
                        auth: {
                            user: process.env.EMAIL_USER,
                            pass: process.env.EMAIL_PASSWORD,
                        },
                    });

                    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
                    const logoCid = 'matcha-logo-renew';
                    const logoPath = path.resolve(__dirname, '../../assets/logo.png');
                    const verifyUrl = `${frontendUrl}/verify-email?token=${newToken}`;

                    const mailOptions = {
                        from: 'Matcha <noreply@matcha.com>',
                        to: email,
                        subject: 'New verification link – Matcha',
                        html: `
                        <!DOCTYPE html>
                        <html lang="en">
                          <head>
                            <meta charset="UTF-8" />
                            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                            <title>New verification link</title>
                          </head>
                          <body style="margin:0;padding:0;background-color:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;padding:32px 0;">
                              <tr>
                                <td align="center">
                                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.08);">
                                    <tr>
                                      <td style="padding:32px 32px 16px 32px;background:linear-gradient(135deg,#ec4899,#db2777);text-align:center;">
                                        <div style="display:inline-block;width:140px;height:140px;background-color:#fdf2f8;border-radius:50%;box-shadow:0 4px 12px rgba(0,0,0,0.15);padding:10px;margin-bottom:16px;">
                                          <img src="cid:${logoCid}" alt="Matcha" style="max-width:120px;height:auto;display:block;margin:0 auto;" />
                                        </div>
                                        <h1 style="margin:0;font-size:26px;line-height:1.3;color:#ffffff;">New verification link</h1>
                                        <p style="margin:12px 0 0 0;font-size:14px;color:#fde7f3;">
                                          Your previous link has expired
                                        </p>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td style="padding:28px 32px 8px 32px;">
                                        <p style="margin:0 0 16px 0;font-size:15px;color:#111827;">
                                          Your previous verification link has expired. Here is a new link to verify your email address (valid for <strong>15 minutes</strong>).
                                        </p>
                                        <p style="margin:0 0 24px 0;font-size:15px;color:#374151;">
                                          Click the button below to verify your account&nbsp;:
                                        </p>
                                        <div style="text-align:center;margin:0 0 28px 0;">
                                          <a href="${verifyUrl}"
                                             style="display:inline-block;background:linear-gradient(135deg,#ec4899,#db2777);color:#ffffff;text-decoration:none;
                                                    padding:12px 28px;border-radius:999px;font-size:15px;font-weight:600;">
                                            Verify my email
                                          </a>
                                        </div>
                                        <p style="margin:0 0 8px 0;font-size:13px;color:#6b7280;">
                                          If the button doesn't work, copy and paste this link in your browser&nbsp;:
                                        </p>
                                        <p style="margin:0;font-size:12px;color:#9ca3af;word-break:break-all;">
                                          <a href="${verifyUrl}" style="color:#ec4899;text-decoration:underline;">${verifyUrl}</a>
                                        </p>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td style="padding:16px 32px 24px 32px;border-top:1px solid #f3f4f6;">
                                        <p style="margin:0 0 4px 0;font-size:12px;color:#9ca3af;">
                                          This email was sent automatically, please do not reply to it.
                                        </p>
                                        <p style="margin:0;font-size:12px;color:#9ca3af;">
                                          © ${new Date().getFullYear()} Matcha. All rights reserved.
                                        </p>
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                            </table>
                          </body>
                        </html>
                        `,
                        attachments: [
                            {
                                filename: 'logo.png',
                                path: logoPath,
                                cid: logoCid
                            }
                        ]
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
                from: 'matcha@noreply.com',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD,
                },
            });

            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            const logoCid = 'matcha-logo-reset';
            const logoPath = path.resolve(__dirname, '../../assets/logo.png');
            const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

            const mailOptions = {
                from: 'Matcha <noreply@matcha.com>',
                to: email,
                subject: 'Reset your password – Matcha',
                html: `
                <!DOCTYPE html>
                <html lang="en">
                  <head>
                    <meta charset="UTF-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <title>Reset your password</title>
                  </head>
                  <body style="margin:0;padding:0;background-color:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;padding:32px 0;">
                      <tr>
                        <td align="center">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.08);">
                            <tr>
                              <td style="padding:32px 32px 16px 32px;background:linear-gradient(135deg,#ec4899,#db2777);text-align:center;">
                                <div style="display:inline-block;width:140px;height:140px;background-color:#fdf2f8;border-radius:50%;box-shadow:0 4px 12px rgba(0,0,0,0.15);padding:10px;margin-bottom:16px;">
                                  <img src="cid:${logoCid}" alt="Matcha" style="max-width:120px;height:auto;display:block;margin:0 auto;" />
                                </div>
                                <h1 style="margin:0;font-size:26px;line-height:1.3;color:#ffffff;">Reset your password</h1>
                                <p style="margin:12px 0 0 0;font-size:14px;color:#fde7f3;">
                                  You requested to reset your password
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding:28px 32px 8px 32px;">
                                <p style="margin:0 0 16px 0;font-size:15px;color:#111827;">
                                  Click the button below to choose a new password. This link is valid for <strong>15 minutes</strong>.
                                </p>
                                <p style="margin:0 0 24px 0;font-size:15px;color:#374151;">
                                  If you didn't request a password reset, you can safely ignore this email.
                                </p>
                                <div style="text-align:center;margin:0 0 28px 0;">
                                  <a href="${resetUrl}"
                                     style="display:inline-block;background:linear-gradient(135deg,#ec4899,#db2777);color:#ffffff;text-decoration:none;
                                            padding:12px 28px;border-radius:999px;font-size:15px;font-weight:600;">
                                    Reset my password
                                  </a>
                                </div>
                                <p style="margin:0 0 8px 0;font-size:13px;color:#6b7280;">
                                  If the button doesn't work, copy and paste this link in your browser&nbsp;:
                                </p>
                                <p style="margin:0;font-size:12px;color:#9ca3af;word-break:break-all;">
                                  <a href="${resetUrl}" style="color:#ec4899;text-decoration:underline;">${resetUrl}</a>
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding:16px 32px 24px 32px;border-top:1px solid #f3f4f6;">
                                <p style="margin:0 0 4px 0;font-size:12px;color:#9ca3af;">
                                  This email was sent automatically, please do not reply to it.
                                </p>
                                <p style="margin:0;font-size:12px;color:#9ca3af;">
                                  © ${new Date().getFullYear()} Matcha. All rights reserved.
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </body>
                </html>
                `,
                attachments: [
                    {
                        filename: 'logo.png',
                        path: logoPath,
                        cid: logoCid
                    }
                ]
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
