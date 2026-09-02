import { apiClient } from '@/shared/api/base';
import { ApiResponse } from '@/shared/types';

export interface AdminOverviewMetrics {
  totalStudents: number;
  totalEnrollments: number;
  totalCompletions: number;
  totalLessonsCompleted: number;
  activeStudents: number;
  completionRate: number;
}

export interface CourseFunnelStep {
  stepOrder: number;
  stepName: string;
  dayNumber: number | null;
  lessonId: number | null;
  lessonTitle: string | null;
  studentsCount: number;
  conversionRate: number;
  dropOffRate: number;
}

export interface LessonRetention {
  lessonId: number;
  dayNumber: number;
  lessonTitle: string;
  completedCount: number;
  completionRate: number;
  dropOffRate: number;
  avgDaysToComplete: number;
}

export interface CourseRetention {
  courseId: number;
  courseTitle: string;
  totalEnrolled: number;
  completedCount: number;
  overallCompletionRate: number;
  lessonRetention: LessonRetention[];
}

export interface AiTutorTopic {
  lessonId: number;
  lessonTitle: string;
  courseTitle: string;
  questionCount: number;
  percentage: number;
}

export interface AiTutorTelemetry {
  totalQuestions: number;
  estimatedTokensUsed: number;
  throttledCount: number;
  activeUsersCount: number;
  avgQuestionsPerUser: number;
  topLessonTopics: AiTutorTopic[];
}

export interface QuizHotspot {
  questionId: number;
  questionText: string;
  quizId: number | null;
  quizTitle: string;
  lessonTitle: string;
  courseTitle: string;
  totalAttempts: number;
  failureCount: number;
  failureRate: number;
  passRate: number;
  mostCommonWrongOption: string;
}

export interface AdminAnalyticsExportPayload {
  exportedAt: string;
  courseId: number | null;
  courseTitle: string;
  overview: AdminOverviewMetrics;
  funnel: CourseFunnelStep[];
  retention: CourseRetention | null;
  aiTutorSummary: AiTutorTelemetry;
  quizHotspots: QuizHotspot[];
}

export const adminAnalyticsApi = {
  getOverviewMetrics: async (): Promise<AdminOverviewMetrics> => {
    const res = await apiClient.get<ApiResponse<AdminOverviewMetrics>>('/v1/admin/analytics/overview');
    return res.data.data;
  },

  getCourseFunnel: async (courseId: number): Promise<CourseFunnelStep[]> => {
    const res = await apiClient.get<ApiResponse<CourseFunnelStep[]>>(`/v1/admin/analytics/courses/${courseId}/funnel`);
    return res.data.data;
  },

  getCourseRetention: async (courseId: number): Promise<CourseRetention> => {
    const res = await apiClient.get<ApiResponse<CourseRetention>>(`/v1/admin/analytics/courses/${courseId}/retention`);
    return res.data.data;
  },

  getAiTutorSummary: async (): Promise<AiTutorTelemetry> => {
    const res = await apiClient.get<ApiResponse<AiTutorTelemetry>>('/v1/admin/analytics/ai-tutor/summary');
    return res.data.data;
  },

  getQuizHotspots: async (): Promise<QuizHotspot[]> => {
    const res = await apiClient.get<ApiResponse<QuizHotspot[]>>('/v1/admin/analytics/quizzes/hotspots');
    return res.data.data;
  },

  getExportJson: async (courseId?: number): Promise<AdminAnalyticsExportPayload> => {
    const url = courseId
      ? `/v1/admin/analytics/export?courseId=${courseId}&format=json`
      : '/v1/admin/analytics/export?format=json';
    const res = await apiClient.get<ApiResponse<AdminAnalyticsExportPayload>>(url);
    return res.data.data;
  },

  exportCsv: async (courseId?: number): Promise<Blob> => {
    const url = courseId
      ? `/v1/admin/analytics/export?courseId=${courseId}&format=csv`
      : '/v1/admin/analytics/export?format=csv';
    const res = await apiClient.get<Blob>(url, { responseType: 'blob' });
    return res.data;
  },
};
