import { apiClient } from '@/shared/api/base';
import type { ApiResponse, OutboxMetrics, StudentRisk, SemanticLink } from '@/shared/types';

export const automationApi = {
  getOutboxMetrics: async (): Promise<OutboxMetrics> => {
    const response = await apiClient.get<ApiResponse<OutboxMetrics>>('/v1/admin/automation/outbox-metrics');
    return response.data.data;
  },

  triggerCourseIngestion: async (courseId: number): Promise<{ message: string; courseId: number }> => {
    const response = await apiClient.post<ApiResponse<{ message: string; courseId: number }>>(
      `/v1/admin/automation/ingest/courses/${courseId}`
    );
    return response.data.data;
  },

  getRetentionRisks: async (): Promise<StudentRisk[]> => {
    const response = await apiClient.get<ApiResponse<StudentRisk[]>>('/v1/admin/automation/retention-risks');
    return response.data.data;
  },

  extractSemanticLinks: async (courseId: number, text: string): Promise<SemanticLink[]> => {
    const response = await apiClient.post<ApiResponse<SemanticLink[]>>(
      `/v1/courses/${courseId}/semantic-links`,
      { text }
    );
    return response.data.data;
  },
};
