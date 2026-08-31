import { apiClient } from '@/shared/api/base';
import type {
  ApiResponse,
  HelpRequest,
  HelpRequestStatus,
  CreateHelpRequestPayload,
  ResolveHelpRequestPayload,
} from '@/shared/types';

export const helpApi = {
  createHelpRequest: async (
    courseId: number,
    lessonId: number,
    payload: CreateHelpRequestPayload
  ): Promise<HelpRequest> => {
    const response = await apiClient.post<ApiResponse<HelpRequest>>(
      `/v1/courses/${courseId}/lessons/${lessonId}/help-requests`,
      payload
    );
    return response.data.data;
  },

  getLessonHelpRequests: async (
    courseId: number,
    lessonId: number
  ): Promise<HelpRequest[]> => {
    const response = await apiClient.get<ApiResponse<HelpRequest[]>>(
      `/v1/courses/${courseId}/lessons/${lessonId}/help-requests`
    );
    return response.data.data;
  },

  getAllHelpRequests: async (status?: HelpRequestStatus): Promise<HelpRequest[]> => {
    const params = status ? { status } : {};
    const response = await apiClient.get<ApiResponse<HelpRequest[]>>('/v1/admin/help-requests', {
      params,
    });
    return response.data.data;
  },

  resolveHelpRequest: async (
    requestId: number,
    payload: ResolveHelpRequestPayload
  ): Promise<HelpRequest> => {
    const response = await apiClient.post<ApiResponse<HelpRequest>>(
      `/v1/admin/help-requests/${requestId}/resolve`,
      payload
    );
    return response.data.data;
  },
};
