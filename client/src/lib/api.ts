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

  // Extract relative path if localhost or /uploads/ path was stored in DB
  let relativePath = fileUrl;
  if (fileUrl.includes('/uploads/')) {
    relativePath = '/uploads/' + fileUrl.split('/uploads/')[1];
  } else if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://') || fileUrl.startsWith('blob:') || fileUrl.startsWith('data:')) {
    // If it's a real external URL (e.g. Cloudinary), return as is
    if (!fileUrl.includes('localhost:') && !fileUrl.includes('127.0.0.1:')) {
      return fileUrl;
    }
    try {
      relativePath = new URL(fileUrl).pathname;
    } catch {
      relativePath = fileUrl;
    }
  }

  const apiDomain = cleanBaseUrl.replace(/\/api$/, '');
  const cleanPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  return `${apiDomain}${cleanPath}`;
};

export default api;
