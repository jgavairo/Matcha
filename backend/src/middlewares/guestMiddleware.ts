import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { getUserById } from "../models/userModel";


export const guestMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.token as string;
    
    if (!token) {
        return next();
    }
    
    try {
        const decoded = verifyToken(token);
        
        // If token is invalid/expired, clear it and allow access
        if (!decoded) {
            res.clearCookie('token');
            return next();
        }
        
        // If token is valid, verify that the user still exists in the database
        // This handles cases where the database was reset but the token is still valid
        const user = await getUserById(decoded.id);
        
        // If user exists, they are authenticated - block access
        if (user) {
            return res.status(403).json({ error: 'You are already authenticated' });
        }
        
        // If user doesn't exist, clear the invalid token and allow access
        res.clearCookie('token');
        return next();
    } catch (error) {
        // If JWT_SECRET is not defined, this is a critical configuration error
        console.error('Critical configuration error:', error);
        return res.status(500).json({ error: 'Server configuration error' });
    }
};

