import { apiClient } from '@/shared/api/base';
import { ApiResponse } from '@/shared/types';

export interface AdminOverviewMetrics {
  totalStudents: number;
  totalEnrollments: number;
  totalCompletions: number;
  totalLessonsCompleted: number;
  averageStreak: number;
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

export interface StreakDistribution {
  range: string;
  count: number;
  percentage: number;
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

export const adminAnalyticsApi = {
  getOverviewMetrics: async (): Promise<AdminOverviewMetrics> => {
    const res = await apiClient.get<ApiResponse<AdminOverviewMetrics>>('/v1/admin/analytics/overview');
    return res.data.data;
  },

  getCourseFunnel: async (courseId: number): Promise<CourseFunnelStep[]> => {
    const res = await apiClient.get<ApiResponse<CourseFunnelStep[]>>(`/v1/admin/analytics/courses/${courseId}/funnel`);
    return res.data.data;
  },

  getStreakDistribution: async (): Promise<StreakDistribution[]> => {
    const res = await apiClient.get<ApiResponse<StreakDistribution[]>>('/v1/admin/analytics/streaks');
    return res.data.data;
  },

  getCourseRetention: async (courseId: number): Promise<CourseRetention> => {
    const res = await apiClient.get<ApiResponse<CourseRetention>>(`/v1/admin/analytics/courses/${courseId}/retention`);
    return res.data.data;
  },
};
