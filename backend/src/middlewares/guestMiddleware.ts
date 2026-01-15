import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";


export const guestMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.token as string;
    
    if (!token) {
        return next();
    }
    
    try {
        const decoded = verifyToken(token);
        
        if (decoded) {
            return res.status(403).json({ error: 'You are already authenticated' });
        }
        
        next();
    } catch (error) {
        // If JWT_SECRET is not defined, this is a critical configuration error
        console.error('Critical configuration error:', error);
        return res.status(500).json({ error: 'Server configuration error' });
    }
};

