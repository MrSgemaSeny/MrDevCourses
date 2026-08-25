import { apiClient } from '@/shared/api/base';
import { ApiResponse, CourseProgress } from '@/shared/types';

export const progressApi = {
  getAllProgress: async (): Promise<CourseProgress[]> => {
    const res = await apiClient.get<ApiResponse<CourseProgress[]>>('/v1/progress');
    return res.data.data;
  },

  getCourseProgress: async (courseId: number): Promise<CourseProgress> => {
    const res = await apiClient.get<ApiResponse<CourseProgress>>(`/v1/progress/${courseId}`);
    return res.data.data;
  },
};
