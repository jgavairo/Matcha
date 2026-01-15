import { Request, Response, NextFunction } from "express";
import { verifyToken, JwtPayload } from "../utils/jwt";

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.token as string;
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Critical configuration error:', error);
        return res.status(500).json({ error: 'Server configuration error' });
    }
};