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

export const getApiFileUrl = (fileUrl?: string): string => {
  if (!fileUrl) return '';
  if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://') || fileUrl.startsWith('blob:') || fileUrl.startsWith('data:')) {
    return fileUrl;
  }
  const apiDomain = cleanBaseUrl.replace(/\/api$/, '');
  const cleanPath = fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`;
  return `${apiDomain}${cleanPath}`;
};

export default api;
