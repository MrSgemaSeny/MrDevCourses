import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { userApi } from '@/entities/user/api/userApi';
import type { User } from '@/entities/user/model/types';

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  loginWithGoogle: () => void;
  loginWithEmail: (email: string, password: string, rememberMe?: boolean) => Promise<User>;
  register: (email: string, name: string, password: string, rememberMe?: boolean) => Promise<User>;
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

const SESSION_STORAGE_KEY = 'mrdev_user_session';

const getInitialUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
};

export const AuthContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(getInitialUser);
  const [isLoading, setIsLoading] = useState<boolean>(() => !getInitialUser());

  const checkAuth = useCallback(async () => {
    try {
      const currentUser = await userApi.getMe();
      setUser(currentUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(currentUser));
      }
    } catch {
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
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

  const loginWithEmail = useCallback(async (email: string, password: string, rememberMe: boolean = true): Promise<User> => {
    const userData = await userApi.loginWithEmail(email, password, rememberMe);
    setUser(userData);
    if (typeof window !== 'undefined') {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(userData));
    }
    return userData;
  }, []);

  const register = useCallback(async (email: string, name: string, password: string, rememberMe: boolean = true): Promise<User> => {
    const userData = await userApi.register(email, name, password, rememberMe);
    setUser(userData);
    if (typeof window !== 'undefined') {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(userData));
    }
    return userData;
  }, []);

  const logout = useCallback(async () => {
    try {
      await userApi.logout();
    } finally {
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
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
