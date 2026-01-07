import { body, ValidationChain } from 'express-validator';
import { 
    EMAIL_REGEX, 
    USERNAME_REGEX, 
    NAME_REGEX, 
    BIRTH_DATE_REGEX, 
    PASSWORD_REGEX, 
    BIOGRAPHY_REGEX,
    BIOGRAPHY_MIN,
    BIOGRAPHY_MAX,
    CITY_MIN,
    CITY_MAX,
    TAGS_MIN
} from '@shared/validation';

export const validateRegister: ValidationChain[] = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email')
        .matches(EMAIL_REGEX).withMessage('Invalid email'),
    
    body('username')
        .trim()
        .notEmpty().withMessage('Username is required')
        .matches(USERNAME_REGEX).withMessage('Invalid username'),
    
    body('firstName')
        .trim()
        .notEmpty().withMessage('First name is required')
        .matches(NAME_REGEX).withMessage('Invalid first name'),
    
    body('lastName')
        .trim()
        .notEmpty().withMessage('Last name is required')
        .matches(NAME_REGEX).withMessage('Invalid last name'),
    
    body('birthDate')
        .trim()
        .notEmpty().withMessage('Birth date is required')
        .matches(BIRTH_DATE_REGEX).withMessage('Invalid birth date'),
    
    body('password')
        .trim()
        .notEmpty().withMessage('Password is required')
        .matches(PASSWORD_REGEX).withMessage('Invalid password'),

    body('confirmPassword')
        .trim()
        .notEmpty().withMessage('Confirm password is required')
        .custom((value, { req }) => value === req.body.password).withMessage('Passwords do not match'),
];

export const completeProfileValidation: ValidationChain[] = [
    body('gender')
        .notEmpty().withMessage('Gender is required')
        .isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
    
    body('sexualPreferences')
        .isArray({ min: 1 }).withMessage('At least one preference is required')
        .custom((value) => {
            const valid = ['male', 'female', 'other'];
            return value.every((pref: string) => valid.includes(pref));
        }).withMessage('Invalid sexual preferences'),

    body('biography')
        .trim()
        .notEmpty().withMessage('Biography is required')
        .isLength({ min: BIOGRAPHY_MIN, max: BIOGRAPHY_MAX }).withMessage(`Biography must be between ${BIOGRAPHY_MIN} and ${BIOGRAPHY_MAX} characters`)
        .matches(BIOGRAPHY_REGEX).withMessage('Invalid biography'),

    body('tags')
        .isArray({ min: TAGS_MIN }).withMessage(`At least ${TAGS_MIN} tag is required`),

    body('city')
        .trim()
        .notEmpty().withMessage('City is required')
        .isLength({ min: CITY_MIN, max: CITY_MAX }).withMessage(`City must be between ${CITY_MIN} and ${CITY_MAX} characters`),
];

// Validation pour mettre à jour le profil (tous les champs optionnels mais valides si présents)
export const validateUpdateProfile: ValidationChain[] = [
    body('email')
        .optional()
        .trim()
        .isEmail().withMessage('Invalid email')
        .matches(EMAIL_REGEX).withMessage('Invalid email'),
    
    body('username')
        .optional()
        .trim()
        .matches(USERNAME_REGEX).withMessage('Invalid username'),
    
    body('firstName')
        .optional()
        .trim()
        .matches(NAME_REGEX).withMessage('Invalid first name'),
    
    body('lastName')
        .optional()
        .trim()
        .matches(NAME_REGEX).withMessage('Invalid last name'),
    
    body('biography')
        .optional()
        .trim()
        .isLength({ min: BIOGRAPHY_MIN, max: BIOGRAPHY_MAX }).withMessage(`Biography must be between ${BIOGRAPHY_MIN} and ${BIOGRAPHY_MAX} characters`)
        .matches(BIOGRAPHY_REGEX).withMessage('Invalid biography'),
    
    body('tags')
        .optional()
        .isArray().withMessage('Tags must be an array'),
    
    body('city')
        .optional()
        .trim()
        .isLength({ min: CITY_MIN, max: CITY_MAX }).withMessage(`City must be between ${CITY_MIN} and ${CITY_MAX} characters`),
    
    body('gender')
        .optional()
        .isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
    
    body('sexualPreferences')
        .optional()
        .custom((value) => {
            if (value === undefined || value === null) return true; // Optionnel
            if (!Array.isArray(value)) return false; // Doit être un array si présent
            if (value.length === 0) return false; // Si array, doit avoir au moins 1 élément
            const valid = ['male', 'female', 'other'];
            return value.every((pref: string) => valid.includes(pref));
        }).withMessage('Invalid sexual preferences'),
    
    body('birthDate')
        .optional()
        .trim()
        .matches(BIRTH_DATE_REGEX).withMessage('Invalid birth date format'),
    
    body('latitude')
        .optional()
        .isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
    
    body('longitude')
        .optional()
        .isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
];