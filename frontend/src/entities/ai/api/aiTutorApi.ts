import { apiClient } from '@/shared/api/base';
import type { ApiResponse, AiTutorRequest, AiTutorResponse } from '@/shared/types';

export const aiTutorApi = {
  askTutor: async (request: AiTutorRequest): Promise<AiTutorResponse> => {
    const response = await apiClient.post<ApiResponse<AiTutorResponse>>('/v1/ai/tutor', request);
    return response.data.data;
  },
};
