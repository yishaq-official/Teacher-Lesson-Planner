import axios from 'axios';

const rawBaseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const cleanBaseUrl = rawBaseUrl.replace(/\/$/, '');

export const api = axios.create({
  baseURL: cleanBaseUrl.endsWith('/api') ? cleanBaseUrl : `${cleanBaseUrl}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
