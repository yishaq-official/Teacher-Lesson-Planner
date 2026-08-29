import React, { createContext, useContext } from 'react';
import { useSession, signOut } from '../lib/auth-client.js';
import type { User } from '../types/index.js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  refetchSession: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
  refetchSession: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: sessionData, isPending, refetch } = useSession();

  const rawUser = (sessionData as any)?.user;
  const user: User | null = rawUser
    ? {
        id: rawUser.id,
        name: rawUser.name,
        email: rawUser.email,
        image: rawUser.image || undefined,
        institution: rawUser.institution || '',
        subject: rawUser.subject || '',
      }
    : null;

  const logout = async () => {
    await signOut();
    refetch();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading: isPending,
        logout,
        refetchSession: refetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
