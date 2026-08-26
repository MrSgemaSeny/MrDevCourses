import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { userApi } from '@/entities/user/api/userApi';
import type { User } from '@/entities/user/model/types';

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  loginWithGoogle: () => void;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuthContext = useAuth;

export const AuthContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      const currentUser = await userApi.getMe();
      setUser(currentUser);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const loginWithGoogle = useCallback(() => {
    window.location.href = '/api/oauth2/authorization/google';
  }, []);

  const loginWithEmail = useCallback(async (email: string, password: string) => {
    const userData = await userApi.loginWithEmail(email, password);
    setUser(userData);
  }, []);

  const register = useCallback(async (email: string, name: string, password: string) => {
    const userData = await userApi.register(email, name, password);
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    try {
      await userApi.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === 'ADMIN',
    isLoading,
    loginWithGoogle,
    loginWithEmail,
    register,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
