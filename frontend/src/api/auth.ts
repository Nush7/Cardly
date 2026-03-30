import axios from 'axios';

const API_URL = 'http://localhost:5000';
function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function signup(data: Record<string, any>) {
    const res = await axios.post(`${API_URL}/api/auth/signup`, data, {
        withCredentials: true,
    });
    return res.data;
}

export async function login(data: Record<string, any>) {
    const res = await axios.post(`${API_URL}/api/auth/login`, data, {
        withCredentials: true,
    });
    return res.data;
}

export async function getMe() {
    const res = await axios.get(`${API_URL}/api/auth/me`, {
        withCredentials: true,
        headers: getAuthHeaders(),
    });
    return res.data;
}
