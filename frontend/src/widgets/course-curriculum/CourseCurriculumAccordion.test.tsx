import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { CourseCurriculumAccordion } from './CourseCurriculumAccordion';
import type { CourseModule } from '@/shared/types';

const mockModules: CourseModule[] = [
  {
    id: 1,
    courseId: 1,
    title: 'Модуль 1: Введение в проект',
    description: 'Базовые концепции и архитектура',
    sortOrder: 1,
    isFreePreview: true,
    lessonsCount: 2,
    completedLessonsCount: 1,
    lessons: [
      {
        id: 101,
        courseId: 1,
        title: 'Урок 1: Архитектурный манифест',
        dayNumber: 1,
        sortOrder: 1,
        accessible: true,
        isFreePreview: true,
        opensAt: '2026-08-25T10:00:00Z',
        durationMinutes: 15,
        lessonType: 'VIDEO',
        completed: true,
      },
      {
        id: 102,
        courseId: 1,
        title: 'Урок 2: Настройка Spring Boot',
        dayNumber: 2,
        sortOrder: 2,
        accessible: false,
        isFreePreview: false,
        opensAt: '2026-08-26T10:00:00Z',
        durationMinutes: 25,
        lessonType: 'PRACTICE',
        completed: false,
      },
    ],
  },
  {
    id: 2,
    courseId: 1,
    title: 'Модуль 2: Базы данных и RAG',
    description: 'PostgreSQL и pgvector',
    sortOrder: 2,
    isFreePreview: false,
    lessonsCount: 1,
    completedLessonsCount: 0,
    lessons: [
      {
        id: 103,
        courseId: 1,
        title: 'Урок 3: Векторные индексы HNSW',
        dayNumber: 3,
        sortOrder: 1,
        accessible: false,
        opensAt: '2026-08-27T10:00:00Z',
        durationMinutes: 30,
        lessonType: 'ARTICLE',
        completed: false,
      },
    ],
  },
];

describe('CourseCurriculumAccordion Component', () => {
  it('renders modules list, toggles accordion and displays lesson details', () => {
    render(
      <MemoryRouter>
        <CourseCurriculumAccordion courseId={1} modules={mockModules} enrolled={false} />
      </MemoryRouter>
    );

    // Header & summary
    expect(screen.getByText('Программа курса')).toBeInTheDocument();
    expect(screen.getByText(/2 модулей • 3 уроков/i)).toBeInTheDocument();

    // Module 1 is expanded by default
    expect(screen.getByText('Модуль 1: Введение в проект')).toBeInTheDocument();
    expect(screen.getByText('Бесплатный модуль')).toBeInTheDocument();
    expect(screen.getByText('Урок 1: Архитектурный манифест')).toBeInTheDocument();

    // Module 2 is collapsed by default, expand it
    const module2Header = screen.getByText('Модуль 2: Базы данных и RAG');
    fireEvent.click(module2Header);

    expect(screen.getByText('Урок 3: Векторные индексы HNSW')).toBeInTheDocument();
  });
});
