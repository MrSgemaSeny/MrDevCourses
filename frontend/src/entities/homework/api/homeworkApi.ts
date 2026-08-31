import { apiClient } from '@/shared/api/base';
import type { ApiResponse, HomeworkSubmission, HomeworkSubmitRequest } from '@/shared/types';

export const homeworkApi = {
  submitHomework: async (
    courseId: number,
    lessonId: number,
    request: HomeworkSubmitRequest
  ): Promise<HomeworkSubmission> => {
    const response = await apiClient.post<ApiResponse<HomeworkSubmission>>(
      `/v1/courses/${courseId}/lessons/${lessonId}/homework/submit`,
      request
    );
    return response.data.data;
  },

  getSubmissions: async (
    courseId: number,
    lessonId: number
  ): Promise<HomeworkSubmission[]> => {
    const response = await apiClient.get<ApiResponse<HomeworkSubmission[]>>(
      `/v1/courses/${courseId}/lessons/${lessonId}/homework/submissions`
    );
    return response.data.data;
  },

  getSubmissionById: async (submissionId: number): Promise<HomeworkSubmission> => {
    const response = await apiClient.get<ApiResponse<HomeworkSubmission>>(
      `/v1/homework/submissions/${submissionId}`
    );
    return response.data.data;
  },

  getAllHomeworks: async (status?: string): Promise<HomeworkSubmission[]> => {
    const response = await apiClient.get<ApiResponse<HomeworkSubmission[]>>(
      `/v1/admin/homeworks${status ? `?status=${status}` : ''}`
    );
    return response.data.data;
  },

  reviewHomework: async (
    submissionId: number,
    request: { status: string; mentorFeedback?: string }
  ): Promise<HomeworkSubmission> => {
    const response = await apiClient.post<ApiResponse<HomeworkSubmission>>(
      `/v1/admin/homeworks/${submissionId}/review`,
      request
    );
    return response.data.data;
  },
};
