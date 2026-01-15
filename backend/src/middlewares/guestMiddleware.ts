import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";


export const guestMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.token as string;
    
    if (!token) {
        return next();
    }
    
    const decoded = verifyToken(token);
    
    if (decoded) {
        return res.status(403).json({ error: 'You are already authenticated' });
    }
    
    next();
};

