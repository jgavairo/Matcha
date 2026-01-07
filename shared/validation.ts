export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,16}$/;
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
export const NAME_REGEX = /^[a-zA-ZÀ-ÿ\s'-]{2,50}$/;
export const BIRTH_DATE_REGEX = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;
export const BIOGRAPHY_REGEX = /^[a-zA-Z0-9À-ÿ\s.,!?;:()\-'"]{10,500}$/;

export const USERNAME_MIN = 3;
export const USERNAME_MAX = 16;

export const NAME_MIN = 2;
export const NAME_MAX = 50;

export const PASSWORD_MIN = 8;

export const BIOGRAPHY_MIN = 10;
export const BIOGRAPHY_MAX = 500;

export const CITY_MIN = 1;
export const CITY_MAX = 100;

export const TAGS_MIN = 1;

export const PHOTOS_MIN = 1;
