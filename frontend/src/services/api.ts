import axios, { InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

const API_URL = 'http://localhost:5000';

export const publicApi = axios.create({
    baseURL: API_URL
});

export const privateApi = axios.create({
    baseURL: API_URL
});

privateApi.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = Cookies.get('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});