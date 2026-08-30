import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AdminStudentsPage } from './AdminStudentsPage';
import { adminStudentApi } from '@/entities/adminStudentApi';
import { adminApi } from '@/entities/admin/api/adminApi';
import * as authFeature from '@/features/auth';

vi.mock('@/entities/adminStudentApi', () => ({
  adminStudentApi: {
    getStudents: vi.fn(),
    updateStudentRole: vi.fn(),
    enrollStudent: vi.fn(),
    unenrollStudent: vi.fn(),
    getStudentProgress: vi.fn(),
    getAllCohorts: vi.fn(),
  },
}));

vi.mock('@/entities/admin/api/adminApi', () => ({
  adminApi: {
    getCourses: vi.fn(),
  },
}));

vi.mock('@/features/auth', () => ({
  useAuth: vi.fn(),
}));

const mockStudents = {
  content: [
    {
      id: 1,
      email: 'admin@mrdev.com',
      name: 'Admin Master',
      role: 'ADMIN',
      currentStreak: 10,
      longestStreak: 15,
      createdAt: '2026-01-01T00:00:00Z',
      enrollments: [],
    },
    {
      id: 2,
      email: 'student@mrdev.com',
      name: 'Elena Student',
      role: 'STUDENT',
      currentStreak: 4,
      longestStreak: 7,
      createdAt: '2026-01-10T00:00:00Z',
      enrollments: [
        { id: 10, userId: 2, userEmail: 'student@mrdev.com', courseId: 100, courseTitle: 'Spring Boot 3', courseSlug: 'spring-3', enrolledAt: '2026-01-10T00:00:00Z' }
      ],
    },
  ],
  page: 0,
  size: 20,
  totalElements: 2,
  totalPages: 1,
  last: true,
};

describe('AdminStudentsPage', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    vi.mocked(authFeature.useAuth).mockReturnValue({
      user: { id: 1, email: 'admin@mrdev.com', role: 'ADMIN', createdAt: '2026-01-01T00:00:00Z' },
      isAuthenticated: true,
      isAdmin: true,
      isLoading: false,
      loginWithGoogle: vi.fn(),
      loginWithEmail: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      checkAuth: vi.fn(),
    });

    vi.mocked(adminApi.getCourses).mockResolvedValue([
      { id: 100, title: 'Spring Boot 3', slug: 'spring-3', active: true, createdAt: '2026-01-01T00:00:00Z' },
    ]);

    vi.mocked(adminStudentApi.getStudents).mockResolvedValue(mockStudents as any);
    vi.mocked(adminStudentApi.getAllCohorts).mockResolvedValue([]);
  });

  it('renders student console header, table, and opens cohort modal', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AdminStudentsPage />
      </QueryClientProvider>
    );

    // Verify Title
    expect(screen.getByText('Студенты и когорты')).toBeInTheDocument();
    expect(screen.getByText('R2 CONSOLE')).toBeInTheDocument();

    // Verify Table rendered
    await waitFor(() => {
      expect(screen.getByText('admin@mrdev.com')).toBeInTheDocument();
      expect(screen.getByText('student@mrdev.com')).toBeInTheDocument();
      expect(screen.getByText('Spring Boot 3')).toBeInTheDocument();
    });

    // Open Cohort Modal
    const cohortBtn = screen.getByRole('button', { name: /управление когортами/i });
    fireEvent.click(cohortBtn);

    expect(screen.getByText('Управление когортами обучения')).toBeInTheDocument();
  });
});
