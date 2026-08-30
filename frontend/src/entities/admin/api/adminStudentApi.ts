import { apiClient } from '@/shared/api/base';
import {
  ApiResponse,
  PageResponse,
  Student,
  UserRole,
  Enrollment,
  StudentProgressDetail,
  Cohort,
  CreateCohortPayload,
  UpdateCohortPayload,
} from '@/shared/types';

export interface StudentFilterParams {
  q?: string;
  role?: UserRole;
  courseId?: number;
  page?: number;
  size?: number;
}

export const adminStudentApi = {
  getStudents: async (params?: StudentFilterParams): Promise<PageResponse<Student>> => {
    const res = await apiClient.get<ApiResponse<PageResponse<Student>>>('/v1/admin/students', {
      params,
    });
    return res.data.data;
  },

  updateStudentRole: async (userId: number, role: UserRole): Promise<Student> => {
    const res = await apiClient.patch<ApiResponse<Student>>(`/v1/admin/students/${userId}/role`, {
      role,
    });
    return res.data.data;
  },

  enrollStudent: async (userId: number, courseId: number): Promise<Enrollment> => {
    const res = await apiClient.post<ApiResponse<Enrollment>>(`/v1/admin/students/${userId}/enroll/${courseId}`);
    return res.data.data;
  },

  unenrollStudent: async (userId: number, courseId: number): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`/v1/admin/students/${userId}/enroll/${courseId}`);
  },

  getStudentProgress: async (userId: number): Promise<StudentProgressDetail> => {
    const res = await apiClient.get<ApiResponse<StudentProgressDetail>>(`/v1/admin/students/${userId}/progress`);
    return res.data.data;
  },

  getAllCohorts: async (): Promise<Cohort[]> => {
    const res = await apiClient.get<ApiResponse<Cohort[]>>('/v1/admin/cohorts');
    return res.data.data;
  },

  getCohortsByCourse: async (courseId: number): Promise<Cohort[]> => {
    const res = await apiClient.get<ApiResponse<Cohort[]>>(`/v1/admin/courses/${courseId}/cohorts`);
    return res.data.data;
  },

  getCohortById: async (cohortId: number): Promise<Cohort> => {
    const res = await apiClient.get<ApiResponse<Cohort>>(`/v1/admin/cohorts/${cohortId}`);
    return res.data.data;
  },

  createCohort: async (courseId: number, data: CreateCohortPayload): Promise<Cohort> => {
    const res = await apiClient.post<ApiResponse<Cohort>>(`/v1/admin/courses/${courseId}/cohorts`, data);
    return res.data.data;
  },

  updateCohort: async (cohortId: number, data: UpdateCohortPayload): Promise<Cohort> => {
    const res = await apiClient.put<ApiResponse<Cohort>>(`/v1/admin/cohorts/${cohortId}`, data);
    return res.data.data;
  },

  deleteCohort: async (cohortId: number): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`/v1/admin/cohorts/${cohortId}`);
  },
};
