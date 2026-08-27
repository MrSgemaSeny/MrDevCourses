import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { CoursesPage } from './CoursesPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as courseApiModule from '@/entities/course/api/courseApi';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

describe('CoursesPage Component', () => {
  it('renders courses list correctly', async () => {
    vi.spyOn(courseApiModule.courseApi, 'getCourses').mockResolvedValue([
      {
        id: 1,
        title: 'Вайбкодинг с нуля',
        description: 'Практический курс',
        slug: 'vibecoding-zero',
        active: true,
        createdAt: '2026-08-25T10:00:00Z',
        totalLessons: 5,
        enrolled: false,
      },
    ]);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CoursesPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText(/Каталог курсов/i)).toBeInTheDocument();
    expect(await screen.findByText('Вайбкодинг с нуля')).toBeInTheDocument();
    expect(screen.getByText(/Программа курса/i)).toBeInTheDocument();
  });
});
