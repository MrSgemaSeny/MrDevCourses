import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LessonPage } from './LessonPage';
import * as lessonApiModule from '@/entities/lesson/api/lessonApi';
import * as progressApiModule from '@/entities/progress/api/progressApi';

vi.mock('@/features/auth', () => ({
  useAuth: () => ({
    user: {
      id: 1,
      email: 'student@example.com',
      name: 'Студент',
      role: 'STUDENT',
      currentStreak: 3,
      longestStreak: 7,
    },
    isAuthenticated: true,
  }),
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

describe('LessonPage Component with Quick-Nav Drawer Integration', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();

    vi.spyOn(lessonApiModule.lessonApi, 'getLessonDetail').mockResolvedValue({
      id: 101,
      courseId: 1,
      courseTitle: 'Вайбкодинг с нуля',
      courseSlug: 'vibecoding-zero',
      title: 'День 1: Настройка окружения и JWT',
      content: '# Контент урока\n\nРазбор JWT токенов и аутентификации.',
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      dayNumber: 1,
      sortOrder: 1,
      accessible: true,
      opensAt: '2026-08-20T10:00:00Z',
      completed: false,
      nextLessonId: 102,
    });

    vi.spyOn(lessonApiModule.lessonApi, 'getLessons').mockResolvedValue([
      {
        id: 101,
        courseId: 1,
        title: 'День 1: Настройка окружения и JWT',
        dayNumber: 1,
        sortOrder: 1,
        accessible: true,
        opensAt: '2026-08-20T10:00:00Z',
        completed: false,
      },
      {
        id: 102,
        courseId: 1,
        title: 'День 2: Token Bucket Rate Limiting',
        dayNumber: 2,
        sortOrder: 2,
        accessible: true,
        opensAt: '2026-08-21T10:00:00Z',
        completed: false,
      },
    ]);

    vi.spyOn(progressApiModule.progressApi, 'getCourseProgress').mockResolvedValue({
      courseId: 1,
      courseTitle: 'Вайбкодинг с нуля',
      courseDescription: 'Основы разработки с ИИ',
      courseSlug: 'vibecoding-zero',
      enrolledAt: '2026-08-20T10:00:00Z',
      currentDay: 1,
      completedCount: 0,
      totalUnlocked: 2,
      totalLessons: 2,
      progressPercentage: 0,
    });
  });

  const renderLessonPage = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/courses/1/lessons/101']}>
          <Routes>
            <Route path="/courses/:courseId/lessons/:lessonId" element={<LessonPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  it('renders lesson page with YouTube iframe, markdown, context panel, and quick-nav drawer', async () => {
    renderLessonPage();

    // Verify lesson title and markdown content
    expect(await screen.findByText('День 1: Настройка окружения и JWT')).toBeInTheDocument();
    expect(screen.getByText('Разбор JWT токенов и аутентификации.')).toBeInTheDocument();

    // Verify YouTube iframe exists in DOM
    const iframe = screen.getByTitle('День 1: Настройка окружения и JWT');
    expect(iframe).toBeInTheDocument();
    expect(iframe.getAttribute('src')).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');

    // Verify Contextual Panel is rendered
    expect(screen.getByTestId('lesson-context-panel')).toBeInTheDocument();

    // Verify Quick-Nav button exists
    const quickNavBtn = screen.getByRole('button', { name: /Открыть быструю навигацию/i });
    expect(quickNavBtn).toBeInTheDocument();


    // Verify QuickNav Drawer is initially hidden
    const drawer = screen.getByTestId('quick-nav-drawer');
    expect(drawer.className).toContain('translate-x-full');

    // Open QuickNav Drawer
    fireEvent.click(quickNavBtn);

    // Drawer should slide in (translate-x-0)
    expect(drawer.className).toContain('translate-x-0');

    // Crucial check: YouTube iframe remains in DOM without unmounting
    expect(screen.getByTitle('День 1: Настройка окружения и JWT')).toBeInTheDocument();
    expect(screen.getByTitle('День 1: Настройка окружения и JWT')).toBe(iframe);

    // Close drawer
    fireEvent.click(screen.getByTestId('quick-nav-close-btn'));
    expect(drawer.className).toContain('translate-x-full');

    // iframe still remains in DOM
    expect(screen.getByTitle('День 1: Настройка окружения и JWT')).toBe(iframe);
  });
});
