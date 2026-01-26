import axios from 'axios';

/**
 * Axios instance with base URL
 */
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
});

/**
 * Request interceptor to add Authorization header
 */
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
