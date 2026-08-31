import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { WelcomeOnboardingModal } from './WelcomeOnboardingModal';

const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

describe('WelcomeOnboardingModal Component', () => {
  const onCloseMock = vi.fn();

  it('renders welcome guide and Discord community link when open', () => {
    render(
      <MemoryRouter>
        <WelcomeOnboardingModal
          courseTitle="Вайбкодинг: Первый сайт"
          firstLessonUrl="/courses/1/lessons/1"
          isOpen={true}
          onClose={onCloseMock}
        />
      </MemoryRouter>
    );

    expect(screen.getByText(/Добро пожаловать в Вайбкодинг: Первый сайт!/i)).toBeInTheDocument();
    expect(screen.getByText(/1. Закрытый Discord-сервер/i)).toBeInTheDocument();
    expect(screen.getByText('Присоединиться к серверу')).toBeInTheDocument();
    expect(screen.getByText(/Понятно, начать Урок 1/i)).toBeInTheDocument();
  });

  it('navigates to first lesson on start button click', () => {
    render(
      <MemoryRouter>
        <WelcomeOnboardingModal
          courseTitle="Вайбкодинг: Первый сайт"
          firstLessonUrl="/courses/1/lessons/1"
          isOpen={true}
          onClose={onCloseMock}
        />
      </MemoryRouter>
    );

    const startBtn = screen.getByText(/Понятно, начать Урок 1/i);
    fireEvent.click(startBtn);

    expect(onCloseMock).toHaveBeenCalled();
    expect(mockedNavigate).toHaveBeenCalledWith('/courses/1/lessons/1');
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <MemoryRouter>
        <WelcomeOnboardingModal
          courseTitle="Вайбкодинг"
          firstLessonUrl="/courses/1/lessons/1"
          isOpen={false}
          onClose={onCloseMock}
        />
      </MemoryRouter>
    );

    expect(container.firstChild).toBeNull();
  });
});
