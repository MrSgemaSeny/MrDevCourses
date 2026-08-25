import React from 'react';
import { AuthContextProvider, useAuth, useAuthContext, AuthContext, type AuthContextType } from '@/features/auth';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <AuthContextProvider>{children}</AuthContextProvider>;
};

export { useAuth, useAuthContext, AuthContext };
export type { AuthContextType };
