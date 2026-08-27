import { apiClient } from '@/shared/api/base';
import type { ApiResponse, Certificate } from '@/shared/types';

export const certificateApi = {
  getCertificate: async (courseId: number): Promise<Certificate> => {
    const response = await apiClient.get<ApiResponse<Certificate>>(`/v1/courses/${courseId}/certificate`);
    return response.data.data;
  },

  issueCertificate: async (courseId: number): Promise<Certificate> => {
    const response = await apiClient.post<ApiResponse<Certificate>>(`/v1/courses/${courseId}/certificate`);
    return response.data.data;
  },

  verifyCertificate: async (code: string): Promise<Certificate> => {
    const response = await apiClient.get<ApiResponse<Certificate>>(`/v1/certificates/verify/${code}`);
    return response.data.data;
  },

  getPdfDownloadUrl: (code: string): string => {
    return `/api/v1/certificates/${code}/pdf`;
  },
};
