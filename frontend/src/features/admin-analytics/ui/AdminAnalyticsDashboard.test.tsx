import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminAnalyticsDashboard } from './AdminAnalyticsDashboard';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as adminAnalyticsApiModule from '@/entities/admin/api/adminAnalyticsApi';
import * as adminApiModule from '@/entities/admin/api/adminApi';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

describe('AdminAnalyticsDashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(adminAnalyticsApiModule.adminAnalyticsApi, 'getOverviewMetrics').mockResolvedValue({
      totalStudents: 42,
      totalEnrollments: 50,
      totalCompletions: 15,
      totalLessonsCompleted: 320,
      averageStreak: 4.8,
      activeStudents: 28,
      completionRate: 30.0,
    });

    vi.spyOn(adminApiModule.adminApi, 'getCourses').mockResolvedValue([
      {
        id: 1,
        title: 'Вайбкодинг с нуля',
        description: 'Полный курс по вайбкодингу',
        slug: 'vibecoding-zero',
        active: true,
        createdAt: '2026-08-25T10:00:00Z',
      },
    ]);

    vi.spyOn(adminAnalyticsApiModule.adminAnalyticsApi, 'getCourseFunnel').mockResolvedValue([
      {
        stepOrder: 0,
        stepName: 'Зачислено на курс',
        dayNumber: null,
        lessonId: null,
        lessonTitle: null,
        studentsCount: 50,
        conversionRate: 100,
        dropOffRate: 0,
      },
      {
        stepOrder: 1,
        stepName: 'Урок 1: Введение',
        dayNumber: 1,
        lessonId: 101,
        lessonTitle: 'Введение',
        studentsCount: 45,
        conversionRate: 90,
        dropOffRate: 10,
      },
      {
        stepOrder: 2,
        stepName: 'Урок 2: Архитектура',
        dayNumber: 2,
        lessonId: 102,
        lessonTitle: 'Архитектура',

        studentsCount: 35,
        conversionRate: 70,
        dropOffRate: 22.2,
      },
      {
        stepOrder: 3,
        stepName: 'Курс завершен (100%)',
        dayNumber: null,
        lessonId: null,
        lessonTitle: null,
        studentsCount: 15,
        conversionRate: 30,
        dropOffRate: 57.1,
      },
    ]);

    vi.spyOn(adminAnalyticsApiModule.adminAnalyticsApi, 'getStreakDistribution').mockResolvedValue([
      { range: '0 дней', count: 14, percentage: 33.3 },
      { range: '1-3 дня', count: 12, percentage: 28.6 },
      { range: '4-7 дней', count: 8, percentage: 19.0 },
      { range: '8-14 дней', count: 5, percentage: 11.9 },
      { range: '15+ дней', count: 3, percentage: 7.1 },
    ]);

    vi.spyOn(adminAnalyticsApiModule.adminAnalyticsApi, 'getCourseRetention').mockResolvedValue({
      courseId: 1,
      courseTitle: 'Вайбкодинг с нуля',
      totalEnrolled: 50,
      completedCount: 15,
      overallCompletionRate: 30.0,
      lessonRetention: [
        {
          lessonId: 101,
          dayNumber: 1,
          lessonTitle: 'Введение и настройка окружения',
          completedCount: 45,
          completionRate: 90.0,
          dropOffRate: 10.0,
          avgDaysToComplete: 1.2,
        },
        {
          lessonId: 102,
          dayNumber: 2,
          lessonTitle: 'Архитектурные принципы FSD',
          completedCount: 35,
          completionRate: 70.0,
          dropOffRate: 22.2,
          avgDaysToComplete: 2.5,
        },
      ],
    });
  });

  it('renders KPI metric cards properly', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AdminAnalyticsDashboard />
      </QueryClientProvider>
    );

    expect(await screen.findByText('42')).toBeInTheDocument(); // totalStudents
    expect(screen.getByText('50')).toBeInTheDocument(); // totalEnrollments
    expect(screen.getByText('320')).toBeInTheDocument(); // totalLessonsCompleted
    expect(screen.getByText('30%')).toBeInTheDocument(); // completionRate
    expect(screen.getByText(/4.8/)).toBeInTheDocument(); // averageStreak
  });

  it('renders Course Funnel and Streak Distribution charts', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AdminAnalyticsDashboard />
      </QueryClientProvider>
    );

    expect(await screen.findByText(/Прохождение по дням/i)).toBeInTheDocument();
    expect(screen.getByText(/Распределение Streak/i)).toBeInTheDocument();
    expect(screen.getByText('4-7 дней')).toBeInTheDocument();
    expect(screen.getByText('15+ дней')).toBeInTheDocument();
  });

  it('renders Cohort Lesson Retention Table with rows', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AdminAnalyticsDashboard />
      </QueryClientProvider>
    );

    expect(await screen.findByText('Когортное удержание по урокам')).toBeInTheDocument();
    expect(screen.getByText('Введение и настройка окружения')).toBeInTheDocument();
    expect(screen.getByText('Архитектурные принципы FSD')).toBeInTheDocument();
    expect(screen.getByText('1.2 дн.')).toBeInTheDocument();
    expect(screen.getByText('2.5 дн.')).toBeInTheDocument();
  });
});
