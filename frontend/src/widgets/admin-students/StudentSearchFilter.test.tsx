import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { StudentSearchFilter } from './StudentSearchFilter';
import { Course } from '@/shared/types';

const mockCourses: Course[] = [
  { id: 1, title: 'Java Course', slug: 'java', active: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 2, title: 'React Course', slug: 'react', active: true, createdAt: '2026-01-01T00:00:00Z' },
];

describe('StudentSearchFilter', () => {
  it('triggers search change, course change, and reset filter callbacks', () => {
    const handleSearch = vi.fn();
    const handleCourse = vi.fn();
    const handleReset = vi.fn();

    const { rerender } = render(
      <StudentSearchFilter
        searchQuery=""
        onSearchChange={handleSearch}
        selectedCourseId="ALL"
        onCourseChange={handleCourse}
        courses={mockCourses}
        onReset={handleReset}
      />
    );

    // Type in search
    const input = screen.getByPlaceholderText(/поиск по имени или email/i);
    fireEvent.change(input, { target: { value: 'john' } });
    expect(handleSearch).toHaveBeenCalledWith('john');

    // Select course
    const courseSelect = screen.getByDisplayValue('Все курсы');
    fireEvent.change(courseSelect, { target: { value: '1' } });
    expect(handleCourse).toHaveBeenCalledWith(1);

    // Rerender with active filter to show Reset button
    rerender(
      <StudentSearchFilter
        searchQuery="john"
        onSearchChange={handleSearch}
        selectedCourseId={1}
        onCourseChange={handleCourse}
        courses={mockCourses}
        onReset={handleReset}
      />
    );

    const resetBtn = screen.getByRole('button', { name: /сброс/i });
    expect(resetBtn).toBeInTheDocument();
    fireEvent.click(resetBtn);
    expect(handleReset).toHaveBeenCalled();
  });
});
