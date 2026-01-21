import axios, { InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";

export const API_URL = import.meta.env.PROD
  ? `${window.location.protocol}//${window.location.hostname}:5000`
  : "/api";

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = Cookies.get("token");
  if (token) {
    // Axios v1: headers peut être AxiosHeaders
    if (config.headers && typeof (config.headers as any).set === "function") {
      (config.headers as any).set("Authorization", `Bearer ${token}`);
    } else {
      config.headers = config.headers ?? ({} as any);
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const installUnauthorizedInterceptor = (onUnauthorized: () => void) => {
  const id = api.interceptors.response.use(
    (res) => res,
    (error) => {
      if (error?.response?.status === 401) {
        onUnauthorized();
      }
      return Promise.reject(error);
    }
  );

  return () => api.interceptors.response.eject(id);
};
