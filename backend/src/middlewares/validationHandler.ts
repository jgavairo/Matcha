import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        // Formater les erreurs pour retourner un objet clair
        const formattedErrors: { [key: string]: string } = {};
        errors.array().forEach((error: any) => {
            // error.path est le nom du champ (ex: 'email', 'username')
            // error.msg est le message d'erreur
            if (error.path && !formattedErrors[error.path]) {
                formattedErrors[error.path] = error.msg;
            }
        });
        
        return res.status(400).json({ 
            error: 'Validation error',
            details: formattedErrors
        });
    }
    
    // Pas d'erreurs, continuer vers le prochain middleware/contrôleur
    next();
};

