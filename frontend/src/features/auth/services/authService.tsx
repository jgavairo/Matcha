import { publicApi } from "../../../services/api";
import { LoginFormData, RegisterFormData } from "../../../types/forms";


// Registration Service =======================================================

export const registerUser = async (formData: RegisterFormData) => {
    try {
        const response = await publicApi.post('/auth/register', formData);
        return response
    } catch (error) {
        console.error('Error registering user:', error);
        throw error;
    }
};

// Login Service ===============================================================

export const loginUser = async (formData: LoginFormData) => {
    try {
        const response = await publicApi.post('/auth/login', formData);
        return response.data;
    } catch (error) {
        console.error('Error logging in user:', error);
        throw error;
    }
};