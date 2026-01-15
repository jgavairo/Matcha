import axios, { InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

export const API_URL = `${window.location.protocol}//${window.location.hostname}:5000`;

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