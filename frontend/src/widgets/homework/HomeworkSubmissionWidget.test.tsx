import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HomeworkSubmissionWidget } from './HomeworkSubmissionWidget';
import * as homeworkApiModule from '@/entities/homework/api/homeworkApi';

describe('HomeworkSubmissionWidget', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.clearAllMocks();
  });

  it('renders editor, allows code input and triggers submit', async () => {
    vi.spyOn(homeworkApiModule.homeworkApi, 'getSubmissions').mockResolvedValue([]);
    const submitSpy = vi.spyOn(homeworkApiModule.homeworkApi, 'submitHomework').mockResolvedValue({
      id: 1,
      lessonId: 101,
      userId: 1,
      courseId: 1,
      codeSnippet: 'const x = 1;',
      status: 'PASSED',
      score: 95,
      aiFeedback: 'Отличный код!',
      passedTestsCount: 5,
      totalTestsCount: 5,
      createdAt: new Date().toISOString(),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <HomeworkSubmissionWidget courseId={1} lessonId={101} />
      </QueryClientProvider>
    );

    expect(screen.getByText(/AI Code Review & Auto-Grader/i)).toBeInTheDocument();

    const textarea = screen.getByPlaceholderText(/Вставьте код решения/i);
    fireEvent.change(textarea, { target: { value: 'const x = 1;' } });

    const submitBtn = screen.getByRole('button', { name: /Отправить на проверку/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(submitSpy).toHaveBeenCalledWith(1, 101, {
        codeSnippet: 'const x = 1;',
        repositoryUrl: undefined,
      });
    });
  });
});
