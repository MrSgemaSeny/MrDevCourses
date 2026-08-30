import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminCurriculumPage } from './AdminCurriculumPage';
import { adminApi } from '@/entities/adminApi';

vi.mock('@/entities/adminApi', () => ({
  adminApi: {
    getCourses: vi.fn(),
    createCourse: vi.fn(),
    updateCourse: vi.fn(),
    deleteCourse: vi.fn(),
    getModules: vi.fn(),
    createModule: vi.fn(),
    updateModule: vi.fn(),
    deleteModule: vi.fn(),
    reorderModules: vi.fn(),
    createLesson: vi.fn(),
    updateLesson: vi.fn(),
    deleteLesson: vi.fn(),
    reorderLessons: vi.fn(),
    getQuiz: vi.fn(),
    saveQuiz: vi.fn(),
    deleteQuiz: vi.fn(),
    addMaterial: vi.fn(),
    deleteMaterial: vi.fn(),
  },
}));

const mockCourses = [
  {
    id: 1,
    title: 'Java Masterclass',
    description: 'Master Java from core to cloud',
    slug: 'java-masterclass',
    active: true,
    createdAt: '2026-08-30T10:00:00Z',
  },
];

describe('AdminCurriculumPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(adminApi.getCourses).mockResolvedValue(mockCourses);
    vi.mocked(adminApi.getModules).mockResolvedValue([]);
  });

  it('renders page header and course list', async () => {
    render(<AdminCurriculumPage />);

    expect(screen.getByText('Конструктор учебного плана')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Создать курс/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Java Masterclass')).toBeInTheDocument();
      expect(screen.getByText('/java-masterclass')).toBeInTheDocument();
    });
  });

  it('opens create course modal and submits new course', async () => {
    vi.mocked(adminApi.createCourse).mockResolvedValue({
      id: 2,
      title: 'Spring Security Pro',
      description: 'Zero-trust architecture',
      slug: 'spring-security-pro',
      active: true,
      createdAt: '2026-08-30T12:00:00Z',
    });

    render(<AdminCurriculumPage />);

    await waitFor(() => {
      expect(screen.getByText('Java Masterclass')).toBeInTheDocument();
    });

    const createBtn = screen.getByRole('button', { name: /Создать курс/i });
    fireEvent.click(createBtn);

    expect(screen.getByText('Новый курс')).toBeInTheDocument();

    const titleInput = screen.getByPlaceholderText(/Java Fullstack Архитектор/i);
    fireEvent.change(titleInput, { target: { value: 'Spring Security Pro' } });

    const submitBtn = screen.getByRole('button', { name: /Создать курс/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(adminApi.createCourse).toHaveBeenCalledWith({
        title: 'Spring Security Pro',
        slug: 'spring-security-pro',
        description: undefined,
        active: true,
      });
    });
  });
});
