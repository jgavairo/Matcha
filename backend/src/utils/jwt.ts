import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRATION_REMEMBERED = '30d';
const JWT_EXPIRATION_DEFAULT = '1h';

export interface JwtPayload {
    id: number;
}

export const generateToken = (payload: JwtPayload, remember: boolean): string => {
    if (!JWT_SECRET) {
        throw new Error('JWT secret is not set');
    }
    const expiresIn = remember ? JWT_EXPIRATION_REMEMBERED : JWT_EXPIRATION_DEFAULT;
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

export const verifyToken = (token: string): JwtPayload | null => {
    try {
        return jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch {
        return null;
    }
};