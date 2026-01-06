import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

const FIFTEEN_MINUTES = 15 * 60 * 1000;
const THIRTY_MINUTES = 30 * 60 * 1000;
const ONE_HOUR = 60 * 60 * 1000;


export const authLimiter = rateLimit({
    windowMs: FIFTEEN_MINUTES, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: 'Too many requests, please try again later.',
    headers: true,
});

export const registerLimiter = rateLimit({
    windowMs: ONE_HOUR, // 1 hour
    max: 5, // limit each IP to 5 requests per windowMs
    message: 'Too many requests, please try again later.',
    headers: true,
});

export const passwordResetLimiter = rateLimit({
    windowMs: THIRTY_MINUTES, // 30 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: 'Too many requests, please try again later.',
    headers: true,
});