export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,16}$/;
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
export const NAME_REGEX = /^[a-zA-ZÀ-ÿ\s'-]{2,50}$/;

// Versions corrigées pour les attributs HTML pattern (le - doit être échappé ou en fin de classe)
// Note: Pour éviter les problèmes avec le flag 'v' (unicodeSets) des navigateurs modernes,
// on place le - à la fin de la classe de caractères ou on l'échappe
export const USERNAME_PATTERN = '^[a-zA-Z0-9_\\-]{3,16}$';
export const NAME_PATTERN = '^[a-zA-ZÀ-ÿ\\s\'-]{2,50}$'; // - et ' à la fin
export const EMAIL_PATTERN = '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$';
export const PASSWORD_PATTERN = '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$';

