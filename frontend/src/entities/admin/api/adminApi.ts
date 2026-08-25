import { apiClient } from '@/shared/api/base';
import { ApiResponse, Course, Enrollment, LessonDetail, Student } from '@/shared/types';

export interface CreateCoursePayload {
  title: string;
  description?: string;
  slug: string;
  active: boolean;
}

export interface UpdateCoursePayload {
  title: string;
  description?: string;
  slug: string;
  active: boolean;
}

export interface CreateLessonPayload {
  title: string;
  content?: string;
  youtubeUrl?: string;
  dayNumber: number;
  sortOrder?: number;
}

export interface UpdateLessonPayload {
  title: string;
  content?: string;
  youtubeUrl?: string;
  dayNumber: number;
  sortOrder: number;
}

export const adminApi = {
  getCourses: async (): Promise<Course[]> => {
    const res = await apiClient.get<ApiResponse<Course[]>>('/v1/admin/courses');
    return res.data.data;
  },

  createCourse: async (data: CreateCoursePayload): Promise<Course> => {
    const res = await apiClient.post<ApiResponse<Course>>('/v1/admin/courses', data);
    return res.data.data;
  },

  updateCourse: async (courseId: number, data: UpdateCoursePayload): Promise<Course> => {
    const res = await apiClient.put<ApiResponse<Course>>(`/v1/admin/courses/${courseId}`, data);
    return res.data.data;
  },

  deleteCourse: async (courseId: number): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`/v1/admin/courses/${courseId}`);
  },

  getLessons: async (courseId: number): Promise<LessonDetail[]> => {
    const res = await apiClient.get<ApiResponse<LessonDetail[]>>(`/v1/admin/courses/${courseId}/lessons`);
    return res.data.data;
  },

  createLesson: async (courseId: number, data: CreateLessonPayload): Promise<LessonDetail> => {
    const res = await apiClient.post<ApiResponse<LessonDetail>>(`/v1/admin/courses/${courseId}/lessons`, data);
    return res.data.data;
  },

  updateLesson: async (lessonId: number, data: UpdateLessonPayload): Promise<LessonDetail> => {
    const res = await apiClient.put<ApiResponse<LessonDetail>>(`/v1/admin/lessons/${lessonId}`, data);
    return res.data.data;
  },

  deleteLesson: async (lessonId: number): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`/v1/admin/lessons/${lessonId}`);
  },

  getStudents: async (): Promise<Student[]> => {
    const res = await apiClient.get<ApiResponse<Student[]>>('/v1/admin/students');
    return res.data.data;
  },

  enrollStudent: async (userId: number, courseId: number): Promise<Enrollment> => {
    const res = await apiClient.post<ApiResponse<Enrollment>>(`/v1/admin/students/${userId}/enroll/${courseId}`);
    return res.data.data;
  },
};
