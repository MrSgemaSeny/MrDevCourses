import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LessonQuizWidget } from './LessonQuizWidget';
import * as quizApiModule from '@/entities/quiz/api/quizApi';

describe('LessonQuizWidget', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.clearAllMocks();
  });

  it('renders quiz questions, allows selecting options and shows pass results', async () => {
    vi.spyOn(quizApiModule.quizApi, 'getQuiz').mockResolvedValue({
      id: 1,
      lessonId: 10,
      title: 'Spring Security 6 Quiz',
      passingScorePercentage: 80,
      maxAttempts: 3,
      timeLimitSeconds: 600,
      questionsCount: 1,
      questions: [
        {
          id: 50,
          questionText: 'Where to store JWT safely in browser?',
          questionType: 'SINGLE_CHOICE',
          points: 1,
          sortOrder: 1,
          options: [
            { id: 101, optionText: 'In httpOnly cookie', sortOrder: 1 },
            { id: 102, optionText: 'In localStorage', sortOrder: 2 },
          ],
        },
      ],
    });

    const submitSpy = vi.spyOn(quizApiModule.quizApi, 'submitQuiz').mockResolvedValue({
      submissionId: 99,
      quizId: 1,
      scorePercentage: 100,
      passed: true,
      correctCount: 1,
      totalCount: 1,
      passingScorePercentage: 80,
      questionResults: { 50: true },
      questionExplanations: { 50: 'httpOnly cookie protects against XSS attacks.' },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <LessonQuizWidget courseId={1} lessonId={10} />
      </QueryClientProvider>
    );

    expect(await screen.findByText('Spring Security 6 Quiz')).toBeInTheDocument();
    expect(screen.getByText('Where to store JWT safely in browser?')).toBeInTheDocument();

    const correctOptionBtn = screen.getByText('In httpOnly cookie');
    fireEvent.click(correctOptionBtn);

    const submitBtn = screen.getByRole('button', { name: /Завершить квиз/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(submitSpy).toHaveBeenCalledWith(10, {
        quizId: 1,
        selectedOptionIds: { 50: [101] },
      });
    });

    expect(await screen.findByText(/Тест успешно сдан! Результат: 100%/i)).toBeInTheDocument();
    expect(screen.getByText(/httpOnly cookie protects against XSS attacks./i)).toBeInTheDocument();
  });
});
