import axios, { InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

// Use relative URL to leverage Vite proxy in development
export const API_URL = import.meta.env.PROD 
    ? `${window.location.protocol}//${window.location.hostname}:5000` // Keep direct access for prod or adjust if using nginx
    : '/api';

export const api = axios.create({
    baseURL: API_URL,
    withCredentials: true
});


api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = Cookies.get('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});