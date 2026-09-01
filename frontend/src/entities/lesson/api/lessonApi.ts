import { apiClient } from '@/shared/api/base';
import { ApiResponse, LessonDetail, LessonSummary, LessonPitfall } from '@/shared/types';

export const lessonApi = {
  getLessons: async (courseId: number): Promise<LessonSummary[]> => {
    const res = await apiClient.get<ApiResponse<LessonSummary[]>>(`/v1/courses/${courseId}/lessons`);
    return res.data.data;
  },

  getLessonDetail: async (courseId: number, lessonId: number): Promise<LessonDetail> => {
    const res = await apiClient.get<ApiResponse<LessonDetail>>(`/v1/courses/${courseId}/lessons/${lessonId}`);
    return res.data.data;
  },

  getPitfalls: async (courseId: number, lessonId: number): Promise<LessonPitfall[]> => {
    const res = await apiClient.get<ApiResponse<LessonPitfall[]>>(`/v1/courses/${courseId}/lessons/${lessonId}/pitfalls`);
    return res.data.data;
  },

  completeLesson: async (courseId: number, lessonId: number): Promise<LessonSummary> => {
    const res = await apiClient.post<ApiResponse<LessonSummary>>(`/v1/courses/${courseId}/lessons/${lessonId}/complete`);
    return res.data.data;
  },
};
