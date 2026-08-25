import { apiClient } from '@/shared/api/base';
import { ApiResponse, Course, Enrollment } from '@/shared/types';

export const courseApi = {
  getCourses: async (): Promise<Course[]> => {
    const res = await apiClient.get<ApiResponse<Course[]>>('/v1/courses');
    return res.data.data;
  },

  getCourseBySlug: async (slug: string): Promise<Course> => {
    const res = await apiClient.get<ApiResponse<Course>>(`/v1/courses/${slug}`);
    return res.data.data;
  },

  enroll: async (courseId: number): Promise<Enrollment> => {
    const res = await apiClient.post<ApiResponse<Enrollment>>(`/v1/courses/${courseId}/enroll`);
    return res.data.data;
  },
};
