import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminAnalyticsDashboard } from './AdminAnalyticsDashboard';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as adminAnalyticsApiModule from '@/entities/adminAnalyticsApi';
import * as adminApiModule from '@/entities/admin/api/adminApi';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

describe('AdminAnalyticsDashboard Component', () => {
  beforeEach(() => {
    queryClient.clear();
    vi.clearAllMocks();

    vi.spyOn(adminAnalyticsApiModule.adminAnalyticsApi, 'getOverviewMetrics').mockResolvedValue({
      totalStudents: 42,
      totalEnrollments: 50,
      totalCompletions: 15,
      totalLessonsCompleted: 320,
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
        stepName: 'Курс завершен (100%)',
        dayNumber: null,
        lessonId: null,
        lessonTitle: null,
        studentsCount: 15,
        conversionRate: 30,
        dropOffRate: 66.7,
      },
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
      ],
    });

    vi.spyOn(adminAnalyticsApiModule.adminAnalyticsApi, 'getAiTutorSummary').mockResolvedValue({
      totalQuestions: 128,
      estimatedTokensUsed: 43520,
      throttledCount: 4,
      activeUsersCount: 32,
      avgQuestionsPerUser: 4.0,
      topLessonTopics: [
        {
          lessonId: 101,
          lessonTitle: 'Введение и настройка окружения',
          courseTitle: 'Вайбкодинг с нуля',
          questionCount: 42,
          percentage: 32.8,
        },
      ],
    });

    vi.spyOn(adminAnalyticsApiModule.adminAnalyticsApi, 'getQuizHotspots').mockResolvedValue([
      {
        questionId: 501,
        questionText: 'Какая аннотация используется для внедрения зависимостей?',
        quizId: 201,
        quizTitle: 'Квиз по основам Spring',
        lessonTitle: 'Введение и настройка окружения',
        courseTitle: 'Вайбкодинг с нуля',
        totalAttempts: 30,
        failureCount: 12,
        failureRate: 40.0,
        passRate: 60.0,
        mostCommonWrongOption: '@Inject вместо @Autowired',
      },
    ]);
  });

  it('renders KPI metric cards properly', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AdminAnalyticsDashboard />
      </QueryClientProvider>
    );

    expect(await screen.findByText('50')).toBeInTheDocument(); // totalEnrollments
    const elements42 = screen.getAllByText('42');
    expect(elements42.length).toBeGreaterThan(0);
    expect(screen.getByText('320')).toBeInTheDocument(); // totalLessonsCompleted
    expect(screen.getByText('30%')).toBeInTheDocument(); // completionRate
    expect(screen.getByText('28 активных за 7 дн.')).toBeInTheDocument(); // activeStudents
  });

  it('renders Course Funnel chart', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AdminAnalyticsDashboard />
      </QueryClientProvider>
    );

    expect(await screen.findByText(/Пошаговое прохождение курса/i)).toBeInTheDocument();
  });

  it('renders AI Tutor telemetry widget with metrics and topics', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AdminAnalyticsDashboard />
      </QueryClientProvider>
    );

    expect(await screen.findByText(/Телеметрия AI Tutor/i)).toBeInTheDocument();
    expect(await screen.findByText('128')).toBeInTheDocument(); // totalQuestions
    expect(screen.getAllByText(/Введение и настройка окружения/i).length).toBeGreaterThan(0);
  });

  it('renders Quiz hotspots widget with failure rates and common wrong answer', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AdminAnalyticsDashboard />
      </QueryClientProvider>
    );

    expect(await screen.findByText(/Quiz Failure Hotspots/i)).toBeInTheDocument();
    expect(
      screen.getByText('Какая аннотация используется для внедрения зависимостей?')
    ).toBeInTheDocument();
    expect(screen.getByText('40% ошибок')).toBeInTheDocument();
    expect(screen.getByText(/@Inject вместо @Autowired/i)).toBeInTheDocument();
  });

  it('renders Cohort Lesson Retention Table with rows', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AdminAnalyticsDashboard />
      </QueryClientProvider>
    );

    expect(await screen.findByText('Когортное удержание по урокам')).toBeInTheDocument();
    expect(await screen.findByText('1.2 дн.')).toBeInTheDocument();
    expect(screen.getAllByText(/Введение и настройка окружения/i).length).toBeGreaterThan(0);
  });

  it('opens Export Report Modal when clicking export button', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AdminAnalyticsDashboard />
      </QueryClientProvider>
    );

    const exportBtn = await screen.findByRole('button', { name: /Экспорт отчета/i });
    fireEvent.click(exportBtn);

    expect(await screen.findByText('Экспорт аналитики платформы')).toBeInTheDocument();
    expect(screen.getByText('CSV-таблица')).toBeInTheDocument();
    expect(screen.getByText('JSON-данные')).toBeInTheDocument();
  });
});
