import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { CourseDetailPage } from './CourseDetailPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as courseApiModule from '@/entities/course/api/courseApi';
import * as lessonApiModule from '@/entities/lesson/api/lessonApi';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

vi.mock('@/features/auth', () => ({
  useAuth: () => ({
    user: { id: 1, email: 'student@example.com', role: 'STUDENT' },
    isAuthenticated: true,
  }),
}));

describe('CourseDetailPage Component', () => {
  it('renders enrolled course syllabus and roadmap', async () => {
    vi.spyOn(courseApiModule.courseApi, 'getCourseBySlug').mockResolvedValue({
      id: 1,
      title: 'Вайбкодинг с нуля',
      description: 'Курс разработки с ИИ',
      slug: 'vibecoding-zero',
      active: true,
      createdAt: '2026-08-25T10:00:00Z',
      enrolled: true,
      totalLessons: 2,
      modules: [
        {
          id: 1,
          courseId: 1,
          title: 'Модуль 1',
          sortOrder: 1,
          isFreePreview: false,
          lessonsCount: 1,
          completedLessonsCount: 0,
          lessons: [
            {
              id: 101,
              courseId: 1,
              moduleId: 1,
              title: 'Урок 1: Настройка окружения',
              dayNumber: 1,
              sortOrder: 1,
              accessible: true,
              opensAt: '2026-08-25T10:00:00Z',
              completed: false,
            },
          ],
        },
      ],
    });

    vi.spyOn(lessonApiModule.lessonApi, 'getLessons').mockResolvedValue([
      {
        id: 101,
        courseId: 1,
        title: 'Урок 1: Настройка окружения',
        dayNumber: 1,
        sortOrder: 1,
        accessible: true,
        opensAt: '2026-08-25T10:00:00Z',
        completed: false,
      },
    ]);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/courses/vibecoding-zero']}>
          <Routes>
            <Route path="/courses/:slug" element={<CourseDetailPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(await screen.findByRole('heading', { name: 'Вайбкодинг с нуля' })).toBeInTheDocument();
    expect(await screen.findByText('Урок 1: Настройка окружения')).toBeInTheDocument();
    expect(screen.getAllByText(/Продолжить обучение/i).length).toBeGreaterThan(0);
  });
});
