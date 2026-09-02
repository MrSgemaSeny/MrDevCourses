import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminAnalyticsPage } from './AdminAnalyticsPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as adminAnalyticsApiModule from '@/entities/adminAnalyticsApi';
import * as adminApiModule from '@/entities/admin/api/adminApi';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

describe('AdminAnalyticsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(adminAnalyticsApiModule.adminAnalyticsApi, 'getOverviewMetrics').mockResolvedValue({
      totalStudents: 10,
      totalEnrollments: 12,
      totalCompletions: 3,
      totalLessonsCompleted: 55,
      averageStreak: 3.5,
      activeStudents: 8,
      completionRate: 25.0,
    });

    vi.spyOn(adminApiModule.adminApi, 'getCourses').mockResolvedValue([
      {
        id: 1,
        title: 'Вайбкодинг с нуля',
        description: 'Описание курса',
        slug: 'vibecoding-zero',
        active: true,
        createdAt: '2026-08-25T10:00:00Z',
      },
    ]);

    vi.spyOn(adminAnalyticsApiModule.adminAnalyticsApi, 'getCourseFunnel').mockResolvedValue([]);
    vi.spyOn(adminAnalyticsApiModule.adminAnalyticsApi, 'getStreakDistribution').mockResolvedValue([]);
    vi.spyOn(adminAnalyticsApiModule.adminAnalyticsApi, 'getCourseRetention').mockResolvedValue({
      courseId: 1,
      courseTitle: 'Вайбкодинг с нуля',
      totalEnrolled: 12,
      completedCount: 3,
      overallCompletionRate: 25.0,
      lessonRetention: [],
    });
    vi.spyOn(adminAnalyticsApiModule.adminAnalyticsApi, 'getAiTutorSummary').mockResolvedValue({
      totalQuestions: 10,
      estimatedTokensUsed: 3400,
      throttledCount: 0,
      activeUsersCount: 5,
      avgQuestionsPerUser: 2.0,
      topLessonTopics: [],
    });
    vi.spyOn(adminAnalyticsApiModule.adminAnalyticsApi, 'getQuizHotspots').mockResolvedValue([]);
  });

  it('renders page header and dashboard widget correctly', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AdminAnalyticsPage />
      </QueryClientProvider>
    );

    expect(await screen.findByText('Аналитика и телеметрия платформы')).toBeInTheDocument();
    expect(await screen.findByTestId('admin-analytics-dashboard')).toBeInTheDocument();
  });
});
