export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,16}$/;
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
export const NAME_REGEX = /^[a-zA-ZÀ-ÿ\s'-]{2,50}$/;
export const BIRTH_DATE_REGEX = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;
export const BIOGRAPHY_REGEX = /^[a-zA-Z0-9À-ÿ\s.,!?;:()\-'"]{10,500}$/;