export interface RegisterFormData {
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    birthDate: string;
    password: string;
    confirmPassword: string;
  }

export interface LoginFormData {
    username: string;
    password: string;
    remember: boolean;
  }