import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { StudentTable } from './StudentTable';
import { Student } from '@/shared/types';

const mockStudents: Student[] = [
  {
    id: 1,
    email: 'admin@mrdev.com',
    name: 'Admin User',
    role: 'ADMIN',
    currentStreak: 12,
    longestStreak: 20,
    createdAt: '2026-01-15T10:00:00Z',
    enrollments: [
      { id: 101, userId: 1, userEmail: 'admin@mrdev.com', courseId: 10, courseTitle: 'Spring Boot Mastery', courseSlug: 'spring-mastery', enrolledAt: '2026-01-15T10:00:00Z' },
    ],
  },
  {
    id: 2,
    email: 'student@mrdev.com',
    name: 'Alex Student',
    role: 'STUDENT',
    currentStreak: 3,
    longestStreak: 5,
    createdAt: '2026-02-01T12:00:00Z',
    enrollments: [],
  },
];

describe('StudentTable', () => {
  it('renders student rows and handles actions correctly', () => {
    const handleRoleChange = vi.fn().mockResolvedValue(undefined);
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
        onRoleChange={handleRoleChange}
        onInspectProgress={handleInspect}
        onManageEnrollments={handleManageEnroll}
      />
    );

    expect(screen.getByText('admin@mrdev.com')).toBeInTheDocument();
    expect(screen.getByText('student@mrdev.com')).toBeInTheDocument();
    expect(screen.getByText('Spring Boot Mastery')).toBeInTheDocument();
    expect(screen.getByText('Не зачислен')).toBeInTheDocument();

    // Inspect Progress
    const progressButtons = screen.getAllByRole('button', { name: /прогресс/i });
    fireEvent.click(progressButtons[0]);
    expect(handleInspect).toHaveBeenCalledWith(mockStudents[0]);

    // Manage Enrollments
    const enrollButtons = screen.getAllByRole('button', { name: /зачисления/i });
    fireEvent.click(enrollButtons[1]);
    expect(handleManageEnroll).toHaveBeenCalledWith(mockStudents[1]);
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
        onRoleChange={vi.fn()}
        onInspectProgress={vi.fn()}
        onManageEnrollments={vi.fn()}
      />
    );

    expect(screen.getByText('Студенты не найдены')).toBeInTheDocument();
  });
});
