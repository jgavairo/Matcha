export const EMAIL_REGEX = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
export const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,16}$/;
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
export const NAME_REGEX = /^(?=.{2,50}$)[a-zA-ZÀ-ÿ]+(?:[\s'-][a-zA-ZÀ-ÿ]+)*$/;
export const BIRTH_DATE_REGEX = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;
export const BIOGRAPHY_REGEX = /^(?=.*[a-zA-Z0-9À-ÿ])(?!.*  )[\s\S]{10,500}$/;

export const USERNAME_MIN = 3;
export const USERNAME_MAX = 16;

export const NAME_MIN = 2;
export const NAME_MAX = 25;

export const PASSWORD_MIN = 8;

export const BIOGRAPHY_MIN = 10;
export const BIOGRAPHY_MAX = 250;

export const CITY_MIN = 1;
export const CITY_MAX = 50;

export const TAGS_MIN = 1;

export const PHOTOS_MIN = 1;

export const MIN_AGE = 18;
