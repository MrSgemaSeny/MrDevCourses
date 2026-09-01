import { apiClient } from '@/shared/api/base';
import type { ApiResponse } from '@/shared/types';
import type { User, UserProfile, UpdateUserProfilePayload } from '../model/types';

export const userApi = {
  getMe: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>('/v1/auth/me');
    return response.data.data;
  },

  getProfile: async (): Promise<UserProfile> => {
    const response = await apiClient.get<ApiResponse<UserProfile>>('/v1/users/profile');
    return response.data.data;
  },

  updateProfile: async (payload: UpdateUserProfilePayload): Promise<UserProfile> => {
    const response = await apiClient.put<ApiResponse<UserProfile>>('/v1/users/profile', payload);
    return response.data.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post<ApiResponse<void>>('/v1/auth/logout');
  },

  register: async (email: string, name: string, password: string): Promise<User> => {
    const response = await apiClient.post<ApiResponse<User>>('/v1/auth/register', {
      email,
      name,
      password,
    });
    return response.data.data;
  },

  loginWithEmail: async (email: string, password: string): Promise<User> => {
    const response = await apiClient.post<ApiResponse<User>>('/v1/auth/login', {
      email,
      password,
    });
    return response.data.data;
  },
};
