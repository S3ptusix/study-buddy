import type { LoginFields } from '@/pages/Login';
import type { RegisterFields } from '@/pages/Register';
import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export const register = async (data: RegisterFields) => {
    const response = await axios.post(
        `${API_URL}/api/auth/register`,
        data
    );

    return response.data;
};

export const login = async (data: LoginFields) => {
    const response = await axios.post(
        `${API_URL}/api/auth/login`,
        data,
        { withCredentials: true }
    );

    return response.data;
};

export const getMe = async () => {
    const response = await axios.get(
        `${API_URL}/api/auth/get-me`,
        { withCredentials: true }
    );

    return response.data;
};

export const logout = async () => {
    const response = await axios.post(
        `${API_URL}/api/auth/logout`,
        {},
        { withCredentials: true }
    );

    return response.data;
};