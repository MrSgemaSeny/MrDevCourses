import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CurriculumTree } from './CurriculumTree';
import { adminApi } from '@/entities/adminApi';
import { Course } from '@/shared/types';

vi.mock('@/entities/adminApi', () => ({
  adminApi: {
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

const mockCourse: Course = {
  id: 1,
  title: 'Java Masterclass',
  slug: 'java-masterclass',
  active: true,
  createdAt: '2026-08-30T12:00:00Z',
};

const mockModules = [
  {
    id: 10,
    courseId: 1,
    title: 'Модуль 1: Основы',
    description: 'Базовый модуль',
    sortOrder: 1,
    isFreePreview: true,
    lessonsCount: 1,
    completedLessonsCount: 0,
    lessons: [
      {
        id: 100,
        courseId: 1,
        moduleId: 10,
        title: 'Урок 1: Введение',
        lessonType: 'VIDEO' as const,
        durationMinutes: 15,
        isFreePreview: true,
        isPublished: true,
        dayNumber: 1,
        sortOrder: 1,
        accessible: true,
        opensAt: '2026-08-30T12:00:00Z',
        completed: false,
      },
    ],
  },
];

describe('CurriculumTree', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(adminApi.getModules).mockResolvedValue(mockModules);
  });

  it('renders modules and lessons structure for course', async () => {
    render(<CurriculumTree course={mockCourse} onCourseUpdated={vi.fn()} />);

    expect(screen.getByText(/Структура курса: Java Masterclass/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Модуль 1: Основы')).toBeInTheDocument();
      expect(screen.getByText('Урок 1: Введение')).toBeInTheDocument();
      expect(screen.getByText('День 1')).toBeInTheDocument();
    });
  });

  it('opens add module modal and creates new module', async () => {
    vi.mocked(adminApi.createModule).mockResolvedValue({
      id: 20,
      courseId: 1,
      title: 'Модуль 2: Продвинутый',
      sortOrder: 2,
      isFreePreview: false,
      lessonsCount: 0,
      completedLessonsCount: 0,
      lessons: [],
    });

    render(<CurriculumTree course={mockCourse} onCourseUpdated={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Модуль 1: Основы')).toBeInTheDocument();
    });

    const addBtn = screen.getByRole('button', { name: /Добавить модуль/i });
    fireEvent.click(addBtn);

    expect(screen.getByText('Добавление нового модуля')).toBeInTheDocument();

    const titleInput = screen.getByPlaceholderText(/Модуль 1: Архитектурный фундамент/i);
    fireEvent.change(titleInput, { target: { value: 'Модуль 2: Продвинутый' } });

    const submitBtn = screen.getByRole('button', { name: /Создать модуль/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(adminApi.createModule).toHaveBeenCalledWith(1, {
        title: 'Модуль 2: Продвинутый',
        description: undefined,
        sortOrder: 2,
      });
    });
  });
});
