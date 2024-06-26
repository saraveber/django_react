import axios from 'axios';
import { ACCESS_TOKEN } from './constants';


const api = axios.create({ 
    baseURL: import.meta.env.VITE_API_URL
});


api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Example function to get user profile using the api instance
export const getProfile = async () => {
    try {
        const response = await api.get('api/profile/');
        console.log("I am here")
        return response.data;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
    }
};

export default api;