import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StudentHelpModal } from './StudentHelpModal';
import * as helpApiModule from '@/entities/help/api/helpApi';

describe('StudentHelpModal', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.clearAllMocks();
  });

  it('renders modal, allows entering problem description and submits request', async () => {
    vi.spyOn(helpApiModule.helpApi, 'getLessonHelpRequests').mockResolvedValue([]);
    const submitSpy = vi.spyOn(helpApiModule.helpApi, 'createHelpRequest').mockResolvedValue({
      id: 1,
      userId: 10,
      studentName: 'Test Student',
      studentEmail: 'student@test.com',
      courseId: 1,
      courseTitle: 'Vibe Course',
      lessonId: 101,
      lessonTitle: 'Lesson 1',
      stepIdentifier: 'STEP_1_INSTALL',
      stepTitle: '1. Установка редактора (VS Code / Cursor / расширения)',
      problemText: 'Не могу установить расширение Tailwind',
      status: 'OPEN',
      createdAt: new Date().toISOString(),
    });

    const onClose = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <StudentHelpModal courseId={1} lessonId={101} isOpen={true} onClose={onClose} />
      </QueryClientProvider>
    );

    expect(screen.getByText(/Не получается\? Нужна помощь/i)).toBeInTheDocument();

    const textarea = screen.getByPlaceholderText(/ввел команду ssh-keygen/i);
    fireEvent.change(textarea, { target: { value: 'Не могу установить расширение Tailwind' } });

    const submitBtn = screen.getByRole('button', { name: /Отправить сигнал/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(submitSpy).toHaveBeenCalledWith(1, 101, {
        stepIdentifier: 'STEP_1_INSTALL',
        stepTitle: '1. Установка редактора (VS Code / Cursor / расширения)',
        problemText: 'Не могу установить расширение Tailwind',
        errorLogs: undefined,
      });
    });
  });
});
