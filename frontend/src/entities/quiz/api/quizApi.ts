import { apiClient } from '@/shared/api/base';
import type { ApiResponse, Quiz, QuizSubmitRequest, QuizResult } from '@/shared/types';

export const quizApi = {
  getQuiz: async (lessonId: number): Promise<Quiz> => {
    const response = await apiClient.get<ApiResponse<Quiz>>(`/v1/lessons/${lessonId}/quiz`);
    return response.data.data;
  },

  submitQuiz: async (lessonId: number, request: QuizSubmitRequest): Promise<QuizResult> => {
    const response = await apiClient.post<ApiResponse<QuizResult>>(`/v1/lessons/${lessonId}/quiz/submit`, request);
    return response.data.data;
  },
};
