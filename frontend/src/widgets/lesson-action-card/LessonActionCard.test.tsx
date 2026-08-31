import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LessonActionCard } from './LessonActionCard';

describe('LessonActionCard Component', () => {
  const onOpenHelpMock = vi.fn();

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders operational action card with setup tools and checklist', () => {
    render(
      <LessonActionCard
        lessonId={1}
        lessonTitle="День 1: Вайбкодинг"
        dayNumber={1}
        starterPrompt="Создай веб-сайт на React"
        onOpenHelp={onOpenHelpMock}
      />
    );

    expect(screen.getByText(/Операционная карточка дня 1/i)).toBeInTheDocument();
    expect(screen.getByText('VS Code')).toBeInTheDocument();
    expect(screen.getByText('Git')).toBeInTheDocument();
    expect(screen.getByText(/Шаг 1: Скачать и открыть стартовый шаблон/i)).toBeInTheDocument();
    expect(screen.getByText('Создай веб-сайт на React')).toBeInTheDocument();
  });

  it('toggles checklist steps and updates completed counter', () => {
    render(
      <LessonActionCard
        lessonId={1}
        lessonTitle="День 1: Вайбкодинг"
        dayNumber={1}
        onOpenHelp={onOpenHelpMock}
      />
    );

    expect(screen.getByText(/Выполнено шагов:/i)).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();

    const step1Btn = screen.getByText(/Шаг 1: Скачать и открыть стартовый шаблон/i);
    fireEvent.click(step1Btn);

    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('triggers onOpenHelp when clicking stuck button on a step', () => {
    render(
      <LessonActionCard
        lessonId={1}
        lessonTitle="День 1: Вайбкодинг"
        dayNumber={1}
        onOpenHelp={onOpenHelpMock}
      />
    );

    const stuckButtons = screen.getAllByTitle(/Застряли на этом шаге/i);
    expect(stuckButtons.length).toBeGreaterThan(0);

    fireEvent.click(stuckButtons[0]);
    expect(onOpenHelpMock).toHaveBeenCalledWith('step_1', expect.stringContaining('Шаг 1'));
  });
});
