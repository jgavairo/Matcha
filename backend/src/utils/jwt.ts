import jwt from 'jsonwebtoken';

const JWT_EXPIRATION_REMEMBERED = '30d';
const JWT_EXPIRATION_DEFAULT = '1h';

export interface JwtPayload {
    id: number;
}

export const generateToken = (payload: JwtPayload, remember: boolean): string => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT secret is not set');
    }
    const expiresIn = remember ? JWT_EXPIRATION_REMEMBERED : JWT_EXPIRATION_DEFAULT;
    return jwt.sign(payload, secret, { expiresIn });
};

export const verifyToken = (token: string): JwtPayload | null => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        // If secret is missing, we can't verify, so return null or throw.
        // Returning null is safer for the caller who expects JwtPayload | null.
        console.error('JWT secret is not set');
        return null;
    }
    try {
        return jwt.verify(token, secret) as JwtPayload;
    } catch {
        return null;
    }
};