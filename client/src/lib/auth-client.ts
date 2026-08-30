import { createAuthClient } from 'better-auth/react';

const apiBaseUrl = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/$/, '');

export const authClient = createAuthClient({
  baseURL: apiBaseUrl,
});

export const { useSession, signIn, signUp, signOut } = authClient;
