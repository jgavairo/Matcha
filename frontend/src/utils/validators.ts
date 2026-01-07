import { MIN_AGE } from '@shared/validation';

export const validateAge = (value: string | Date | undefined | null) => {
    if (!value) return "Birth date is required";
    const date = new Date(value);
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const m = today.getMonth() - date.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < date.getDate())) {
        age--;
    }
    return age >= MIN_AGE || `You must be at least ${MIN_AGE} years old`;
};
