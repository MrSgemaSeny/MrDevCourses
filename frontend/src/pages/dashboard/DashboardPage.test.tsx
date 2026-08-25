import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { DashboardPage } from './DashboardPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as progressApiModule from '@/entities/progress/api/progressApi';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

vi.mock('@/features/auth', () => ({
  useAuth: () => ({
    user: { id: 1, email: 'murat@example.com', name: 'Murat', role: 'STUDENT', createdAt: '2026-08-25T10:00:00Z' },
    isAuthenticated: true,
  }),
}));

describe('DashboardPage Component', () => {
  it('renders student progress overview', async () => {
    vi.spyOn(progressApiModule.progressApi, 'getAllProgress').mockResolvedValue([
      {
        courseId: 1,
        courseTitle: 'Вайбкодинг с нуля',
        courseSlug: 'vibecoding-zero',
        enrolledAt: '2026-08-25T10:00:00Z',
        currentDay: 1,
        completedCount: 1,
        totalUnlocked: 1,
        totalLessons: 5,
        progressPercentage: 20,
      },
    ]);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText(/Личный кабинет студента/i)).toBeInTheDocument();
    expect(await screen.findByText('Вайбкодинг с нуля')).toBeInTheDocument();
    expect(screen.getByText(/День 1/i)).toBeInTheDocument();
  });
});
