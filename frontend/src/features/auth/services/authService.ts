import { api } from "@services/api";
import { LoginFormData, RegisterFormData, ForgotPasswordFormData } from "@app-types/forms";

const authService = {
    async login(formData: LoginFormData) {
    try {
        const response = await api.post('/auth/login', formData);
            return response.data;
        } catch (error) {
            console.error('Error logging in user:', error);
            throw error;
        }
    },
    async register(formData: RegisterFormData) {
        try {
            const response = await api.post('/auth/register', formData);
            return response.data;
        } catch (error) {
            console.error('Error registering user:', error);
            throw error;
        }
    },
    async logout() {
        try {
            const response = await api.post('/auth/logout');
            return response.data;
        } catch (error) {
            console.error('Error logging out user:', error);
            throw error;
        }
    },
    async checkAuth() {
        try {
            const response = await api.get('/auth/me');
            return response.data;
        } catch (error) {
            console.error('Error checking auth:', error);
            throw error;
        }
    },
    async forgotPassword(formData: ForgotPasswordFormData) {
        try {
            const response = await api.post('/auth/forgot-password', formData);
            return response;
        } catch (error) {
            console.error('Error sending forgot password email:', error);
            throw error;
        }
    }
};

export default authService;