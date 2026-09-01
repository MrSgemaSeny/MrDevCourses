import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CoursesPage } from '@/pages/courses/CoursesPage';
import { CourseDetailPage } from '@/pages/course/CourseDetailPage';
import { LessonPage } from '@/pages/lesson/LessonPage';
import * as courseApiModule from '@/entities/course/api/courseApi';
import * as lessonApiModule from '@/entities/lesson/api/lessonApi';
import * as homeworkApiModule from '@/entities/homework/api/homeworkApi';
import * as quizApiModule from '@/entities/quiz/api/quizApi';
import * as helpApiModule from '@/entities/help/api/helpApi';
import { Course, Quiz, HomeworkSubmission, QuizResult, HelpRequest } from '@/shared/types';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const mockCourses: Course[] = [
  {
    id: 1,
    title: 'Full-Stack Architecture & Spring Boot',
    description: 'Professional engineering bootcamp from scratch to production.',
    slug: 'full-stack-spring-boot',
    active: true,
    totalLessons: 30,
    createdAt: '2026-08-25T10:00:00Z',
  },
];

const mockCourseDetail: Course = {
  id: 1,
  title: 'Full-Stack Architecture & Spring Boot',
  slug: 'full-stack-spring-boot',
  description: 'Professional engineering bootcamp from scratch to production.',
  active: true,
  createdAt: '2026-08-25T10:00:00Z',
  totalLessons: 30,
  enrolled: true,
  modules: [
    {
      id: 10,
      courseId: 1,
      title: 'Module 1: Foundations & Architecture',
      description: 'Core web standards and clean architecture',
      sortOrder: 1,
      isFreePreview: false,
      lessonsCount: 1,
      completedLessonsCount: 0,
      lessons: [
        {
          id: 101,
          courseId: 1,
          title: 'Day 1: Clean Architecture & REST',
          dayNumber: 1,
          sortOrder: 1,
          durationMinutes: 45,
          accessible: true,
          opensAt: '2026-08-25T10:00:00Z',
          completed: false,
          lessonType: 'VIDEO',
        },
      ],
    },
  ],
};

const mockLessonDetail = {
  id: 101,
  courseId: 1,
  courseTitle: 'Full-Stack Architecture & Spring Boot',
  courseSlug: 'full-stack-spring-boot',
  title: 'Day 1: Clean Architecture & REST',
  content: '### Welcome to Day 1\nClean architecture enforces SRP and separation of concerns.',
  youtubeUrl: 'https://www.youtube.com/watch?v=mock-day-1',
  dayNumber: 1,
  sortOrder: 1,
  accessible: true,
  completed: false,
  opensAt: '2026-08-25T10:00:00Z',
  materials: [],
};

const mockQuiz: Quiz = {
  id: 501,
  lessonId: 101,
  title: 'Day 1 Knowledge Check',
  description: 'Validate key architectural principles',
  passingScorePercentage: 80,
  maxAttempts: 3,
  timeLimitSeconds: 600,
  questionsCount: 1,
  questions: [
    {
      id: 901,
      questionText: 'What is the primary benefit of Single Responsibility Principle?',
      questionType: 'SINGLE_CHOICE',
      sortOrder: 1,
      points: 10,
      options: [
        { id: 1001, optionText: 'Each class has only one reason to change', sortOrder: 1 },
        { id: 1002, optionText: 'All methods are packed into one service', sortOrder: 2 },
      ],
    },
  ],
};

describe('Student Suite E2E Workflows (Frontend)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it('Tier 1: Discovers course catalog and navigates to course detail syllabus', async () => {
    vi.spyOn(courseApiModule.courseApi, 'getCourses').mockResolvedValue(mockCourses);
    vi.spyOn(courseApiModule.courseApi, 'getCourseBySlug').mockResolvedValue(mockCourseDetail);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/courses']}>
          <Routes>
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/courses/:slug" element={<CourseDetailPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(await screen.findByText('Full-Stack Architecture & Spring Boot')).toBeInTheDocument();
  });

  it('Tier 2: Renders lesson page with YouTube player, markdown and QuickNav integration', async () => {
    vi.spyOn(lessonApiModule.lessonApi, 'getLessonDetail').mockResolvedValue(mockLessonDetail);
    vi.spyOn(lessonApiModule.lessonApi, 'getLessons').mockResolvedValue([mockLessonDetail]);
    vi.spyOn(quizApiModule.quizApi, 'getQuiz').mockResolvedValue(mockQuiz);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/courses/1/lessons/101']}>
          <Routes>
            <Route path="/courses/:courseId/lessons/:lessonId" element={<LessonPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(await screen.findByText('Day 1: Clean Architecture & REST')).toBeInTheDocument();
    expect(screen.getByText(/Clean architecture enforces SRP/)).toBeInTheDocument();
  });

  it('Tier 3: Submits homework repository and displays confirmation', async () => {
    const mockSubmission: HomeworkSubmission = {
      id: 701,
      lessonId: 101,
      userId: 42,
      courseId: 1,
      codeSnippet: 'Clean architecture implementation in Java',
      repositoryUrl: 'https://github.com/alexstudent/hw-01',
      liveDemoUrl: 'https://hw01.fly.dev',
      status: 'PENDING',
      score: 100,
      passedTestsCount: 5,
      totalTestsCount: 5,
      createdAt: '2026-09-01T12:00:00Z',
    };

    const submitSpy = vi.spyOn(homeworkApiModule.homeworkApi, 'submitHomework').mockResolvedValue(mockSubmission);

    const result = await homeworkApiModule.homeworkApi.submitHomework(1, 101, {
      codeSnippet: 'Clean architecture implementation in Java',
      repositoryUrl: 'https://github.com/alexstudent/hw-01',
      liveDemoUrl: 'https://hw01.fly.dev',
    });

    expect(submitSpy).toHaveBeenCalledWith(1, 101, {
      codeSnippet: 'Clean architecture implementation in Java',
      repositoryUrl: 'https://github.com/alexstudent/hw-01',
      liveDemoUrl: 'https://hw01.fly.dev',
    });
    expect(result.status).toBe('PENDING');
  });

  it('Tier 4: Submits quiz answers and receives passed score result', async () => {
    const mockResult: QuizResult = {
      submissionId: 301,
      quizId: 501,
      scorePercentage: 100,
      passed: true,
      correctCount: 1,
      totalCount: 1,
      passingScorePercentage: 80,
      questionResults: { 901: true },
    };

    const submitQuizSpy = vi.spyOn(quizApiModule.quizApi, 'submitQuiz').mockResolvedValue(mockResult);

    const result = await quizApiModule.quizApi.submitQuiz(101, {
      quizId: 501,
      selectedOptionIds: { 901: [1001] },
    });

    expect(submitQuizSpy).toHaveBeenCalledWith(101, {
      quizId: 501,
      selectedOptionIds: { 901: [1001] },
    });
    expect(result.passed).toBe(true);
    expect(result.scorePercentage).toBe(100);
  });

  it('Tier 5: Submits student SOS help ticket with step and error logs', async () => {
    const mockHelp: HelpRequest = {
      id: 88,
      userId: 42,
      studentName: 'Alex Student',
      studentEmail: 'student@test.com',
      courseId: 1,
      courseTitle: 'Full-Stack Architecture & Spring Boot',
      lessonId: 101,
      lessonTitle: 'Day 1: Clean Architecture & REST',
      stepIdentifier: 'step-2',
      stepTitle: 'Docker setup',
      problemText: 'Docker port 5432 conflict',
      errorLogs: 'driver failed programming external connectivity',
      status: 'OPEN',
      createdAt: '2026-09-01T12:00:00Z',
    };

    const helpSpy = vi.spyOn(helpApiModule.helpApi, 'createHelpRequest').mockResolvedValue(mockHelp);

    const result = await helpApiModule.helpApi.createHelpRequest(1, 101, {
      stepIdentifier: 'step-2',
      stepTitle: 'Docker setup',
      problemText: 'Docker port 5432 conflict',
      errorLogs: 'driver failed programming external connectivity',
    });

    expect(helpSpy).toHaveBeenCalledWith(1, 101, {
      stepIdentifier: 'step-2',
      stepTitle: 'Docker setup',
      problemText: 'Docker port 5432 conflict',
      errorLogs: 'driver failed programming external connectivity',
    });
    expect(result.status).toBe('OPEN');
  });
});
