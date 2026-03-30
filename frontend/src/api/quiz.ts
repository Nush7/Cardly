export async function getMyQuizzes() {
    const res = await axios.get(`${API_URL}/api/quiz/mine`, {
        headers: getAuthHeaders(),
        withCredentials: true,
    });
    return res.data;
}
import axios from 'axios';

const API_URL = 'http://localhost:5000';
function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function generateQuiz(formData: FormData) {
    const res = await axios.post(`${API_URL}/api/quiz/generate`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', ...getAuthHeaders() },
        withCredentials: true,
    });
    return res.data;
}

export async function getQuizBySlug(slug: string) {
    const res = await axios.get(`${API_URL}/api/quiz/${slug}`);
    return res.data;
}

export async function attemptQuiz(slug: string, data: Record<string, any>) {
    const res = await axios.post(`${API_URL}/api/quiz/${slug}/attempt`, data);
    return res.data;
}

export async function getQuizStats(slug: string) {
    const res = await axios.get(`${API_URL}/api/quiz/${slug}/stats`, {
        headers: getAuthHeaders(),
        withCredentials: true,
    });
    return res.data;
}
