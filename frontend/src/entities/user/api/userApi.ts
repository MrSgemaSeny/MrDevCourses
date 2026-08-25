import { apiClient } from '@/shared/api/base';
import type { ApiResponse } from '@/shared/types';
import type { User } from '../model/types';

export const userApi = {
  getMe: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>('/v1/auth/me');
    return response.data.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post<ApiResponse<void>>('/v1/auth/logout');
  },
};
