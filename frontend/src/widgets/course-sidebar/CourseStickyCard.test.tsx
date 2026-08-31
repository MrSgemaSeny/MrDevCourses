import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { CourseStickyCard } from './CourseStickyCard';
import type { Course, LessonSummary } from '@/shared/types';

const mockCourse: Course = {
  id: 1,
  title: 'Вайбкодинг с нуля',
  description: 'Курс разработки с ИИ',
  slug: 'vibecoding-zero',
  active: true,
  createdAt: '2026-08-25T10:00:00Z',
  totalLessons: 5,
  enrolled: false,
};

const mockLessons: LessonSummary[] = [
  {
    id: 101,
    courseId: 1,
    title: 'Урок 1: Настройка окружения',
    dayNumber: 1,
    sortOrder: 1,
    accessible: true,
    opensAt: '2026-08-25T10:00:00Z',
    completed: true,
  },
  {
    id: 102,
    courseId: 1,
    title: 'Урок 2: Разработка API',
    dayNumber: 2,
    sortOrder: 2,
    accessible: true,
    opensAt: '2026-08-26T10:00:00Z',
    completed: false,
  },
];

describe('CourseStickyCard Component', () => {
  it('renders enroll button and triggers onEnroll when unenrolled', () => {
    const onEnroll = vi.fn();
    const onPlayTrailer = vi.fn();

    render(
      <MemoryRouter>
        <CourseStickyCard
          course={mockCourse}
          lessons={mockLessons}
          onEnroll={onEnroll}
          onPlayTrailer={onPlayTrailer}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Записаться на курс')).toBeInTheDocument();
    expect(screen.getByTitle('Course Video Preview')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Записаться на курс'));
    expect(onEnroll).toHaveBeenCalledTimes(1);
  });

  it('renders progress bar and continue button when enrolled', () => {
    const enrolledCourse: Course = { ...mockCourse, enrolled: true };

    render(
      <MemoryRouter>
        <CourseStickyCard
          course={enrolledCourse}
          lessons={mockLessons}
          onEnroll={vi.fn()}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Ваш прогресс')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('Продолжить обучение')).toBeInTheDocument();
  });
});
