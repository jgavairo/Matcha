import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

const FIVE_MINUTES = 5 * 60 * 1000;
const TWO_MINUTES = 2 * 60 * 1000;
const ONE_MINUTE = 1 * 60 * 1000;


export const authLimiter = rateLimit({
    windowMs: ONE_MINUTE,
    max: 5, // limit each IP to 5 requests per windowMs
    message: 'Too many requests, please try again later.',
    headers: true,
});

export const registerLimiter = rateLimit({
    windowMs: FIVE_MINUTES,
    max: 5, // limit each IP to 5 requests per windowMs
    message: 'Too many requests, please try again later.',
    headers: true,
});

export const passwordResetLimiter = rateLimit({
    windowMs: TWO_MINUTES,
    max: 5, // limit each IP to 5 requests per windowMs
    message: 'Too many requests, please try again later.',
    headers: true,
});