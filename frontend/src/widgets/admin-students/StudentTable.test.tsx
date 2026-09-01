import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { StudentTable } from './StudentTable';
import { Student } from '@/shared/types';

const mockStudents: Student[] = [
  {
    id: 1,
    email: 'dias@mrdev.com',
    name: 'Dias Student',
    role: 'STUDENT',
    currentStreak: 12,
    longestStreak: 20,
    currentLessonTitle: 'Урок 1: Архитектура',
    estimatedFinishDate: '2026-03-01T00:00:00Z',
    createdAt: '2026-01-15T10:00:00Z',
    enrollments: [
      { id: 100, userId: 1, userEmail: 'dias@mrdev.com', courseId: 5, courseTitle: 'Java Masterclass', courseSlug: 'java-masterclass', enrolledAt: '2026-01-15T10:00:00Z' },
    ],
  },
  {
    id: 2,
    email: 'alex@mrdev.com',
    name: 'Alex Student',
    role: 'STUDENT',
    currentStreak: 3,
    longestStreak: 5,
    currentLessonTitle: 'Не начат',
    createdAt: '2026-02-01T12:00:00Z',
    enrollments: [
      { id: 101, userId: 2, userEmail: 'alex@mrdev.com', courseId: 10, courseTitle: 'Spring Boot Mastery', courseSlug: 'spring-mastery', enrolledAt: '2026-01-15T10:00:00Z' },
    ],
  },
];

describe('StudentTable', () => {
  it('renders student rows and handles actions correctly', () => {
    const handleInspect = vi.fn();
    const handleManageEnroll = vi.fn();
    const handlePageChange = vi.fn();
    const handlePageSizeChange = vi.fn();

    render(
      <StudentTable
        students={mockStudents}
        totalElements={2}
        totalPages={1}
        currentPage={0}
        pageSize={20}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        currentUserId={1}
        onInspectProgress={handleInspect}
        onManageEnrollments={handleManageEnroll}
      />
    );

    expect(screen.getByText('dias@mrdev.com')).toBeInTheDocument();
    expect(screen.getByText('alex@mrdev.com')).toBeInTheDocument();
    expect(screen.getByText('Java Masterclass')).toBeInTheDocument();
    expect(screen.getByText('Spring Boot Mastery')).toBeInTheDocument();
    expect(screen.getByText('Урок 1: Архитектура')).toBeInTheDocument();
    expect(screen.getByText('Не начат')).toBeInTheDocument();

    // Inspect Progress
    const progressButtons = screen.getAllByRole('button', { name: /прогресс/i });
    fireEvent.click(progressButtons[0]);
    expect(handleInspect).toHaveBeenCalledWith(mockStudents[0]);

    // Manage Enrollments
    const enrollButtons = screen.getAllByRole('button', { name: /зачисления/i });
    expect(enrollButtons).toHaveLength(2);
    fireEvent.click(enrollButtons[0]);
    expect(handleManageEnroll).toHaveBeenCalledWith(mockStudents[0]);
  });

  it('renders empty state when students array is empty', () => {
    render(
      <StudentTable
        students={[]}
        totalElements={0}
        totalPages={0}
        currentPage={0}
        pageSize={20}
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
        onInspectProgress={vi.fn()}
        onManageEnrollments={vi.fn()}
      />
    );

    expect(screen.getByText('Студенты не найдены')).toBeInTheDocument();
  });
});
