import { render, screen, fireEvent } from '@testing-library/react';

import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { QuickNavProvider, useQuickNav } from '../model/QuickNavContext';
import { QuickNavDrawer } from './QuickNavDrawer';
import { LessonContextPanel } from '@/widgets/lesson';
import * as progressApiModule from '@/entities/progress/api/progressApi';
import * as lessonApiModule from '@/entities/lesson/api/lessonApi';

vi.mock('@/features/auth', () => ({
  useAuth: () => ({
    user: {
      id: 1,
      email: 'student@example.com',
      name: 'Алексей',
      role: 'STUDENT',
      currentStreak: 5,
      longestStreak: 12,
    },
    isAuthenticated: true,
  }),
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

// Test helper component to trigger QuickNav context actions
const TestController = () => {
  const { openQuickNav, closeQuickNav, isOpen, activeTab } = useQuickNav();
  return (
    <div>
      <span data-testid="status-is-open">{isOpen ? 'open' : 'closed'}</span>
      <span data-testid="status-active-tab">{activeTab}</span>
      <button onClick={() => openQuickNav('glossary')}>Open Glossary</button>
      <button onClick={() => openQuickNav('progress')}>Open Progress</button>
      <button onClick={() => openQuickNav('roadmap')}>Open Roadmap</button>
      <button onClick={() => openQuickNav('glossary', 'JWT')}>Open With JWT</button>
      <button onClick={closeQuickNav}>Close Drawer</button>
    </div>
  );
};

describe('QuickNavDrawer and Contextual Navigation System', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();

    // Mock clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });

    // Mock progress API
    vi.spyOn(progressApiModule.progressApi, 'getCourseProgress').mockResolvedValue({
      courseId: 1,
      courseTitle: 'Вайбкодинг с нуля',
      courseDescription: 'Основы разработки с ИИ',
      courseSlug: 'vibecoding-zero',
      enrolledAt: '2026-08-20T10:00:00Z',
      currentDay: 3,
      completedCount: 2,
      totalUnlocked: 3,
      totalLessons: 5,
      progressPercentage: 40,
      nextUnlockAt: '2026-08-28T10:00:00Z',
    });

    // Mock lessons API
    vi.spyOn(lessonApiModule.lessonApi, 'getLessons').mockResolvedValue([
      {
        id: 101,
        courseId: 1,
        title: 'День 1: Введение и JWT аутентификация',
        dayNumber: 1,
        sortOrder: 1,
        accessible: true,
        opensAt: '2026-08-20T10:00:00Z',
        completed: true,
      },
      {
        id: 102,
        courseId: 1,
        title: 'День 2: Rate Limiting через Bucket4j',
        dayNumber: 2,
        sortOrder: 2,
        accessible: true,
        opensAt: '2026-08-21T10:00:00Z',
        completed: true,
      },
      {
        id: 103,
        courseId: 1,
        title: 'День 3: Drip-Content и Row-Level Security',
        dayNumber: 3,
        sortOrder: 3,
        accessible: true,
        opensAt: '2026-08-22T10:00:00Z',
        completed: false,
      },
    ]);
  });

  const renderWithProviders = (ui: React.ReactNode, initialCourseId = 1, initialLessonId = 103) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <QuickNavProvider initialCourseId={initialCourseId} initialLessonId={initialLessonId}>
            {ui}
          </QuickNavProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  it('renders drawer initially closed with correct hidden styles', () => {
    renderWithProviders(
      <>
        <TestController />
        <QuickNavDrawer />
      </>
    );

    expect(screen.getByTestId('status-is-open')).toHaveTextContent('closed');
    const drawer = screen.getByTestId('quick-nav-drawer');
    expect(drawer.className).toContain('translate-x-full');
  });

  it('opens drawer and updates open state when triggered', () => {
    renderWithProviders(
      <>
        <TestController />
        <QuickNavDrawer />
      </>
    );

    fireEvent.click(screen.getByText('Open Glossary'));
    expect(screen.getByTestId('status-is-open')).toHaveTextContent('open');
    const drawer = screen.getByTestId('quick-nav-drawer');
    expect(drawer.className).toContain('translate-x-0');
  });

  it('closes drawer when clicking close button or backdrop', () => {
    renderWithProviders(
      <>
        <TestController />
        <QuickNavDrawer />
      </>
    );

    fireEvent.click(screen.getByText('Open Glossary'));
    expect(screen.getByTestId('status-is-open')).toHaveTextContent('open');

    // Click close button
    fireEvent.click(screen.getByTestId('quick-nav-close-btn'));
    expect(screen.getByTestId('status-is-open')).toHaveTextContent('closed');

    // Reopen and click backdrop
    fireEvent.click(screen.getByText('Open Glossary'));
    expect(screen.getByTestId('status-is-open')).toHaveTextContent('open');
    fireEvent.click(screen.getByTestId('quick-nav-backdrop'));
    expect(screen.getByTestId('status-is-open')).toHaveTextContent('closed');
  });

  it('closes drawer on Escape keyboard event', () => {
    renderWithProviders(
      <>
        <TestController />
        <QuickNavDrawer />
      </>
    );

    fireEvent.click(screen.getByText('Open Glossary'));
    expect(screen.getByTestId('status-is-open')).toHaveTextContent('open');

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.getByTestId('status-is-open')).toHaveTextContent('closed');
  });

  it('switches between Glossary, Progress, and Roadmap tabs inside drawer', async () => {
    renderWithProviders(
      <>
        <TestController />
        <QuickNavDrawer />
      </>
    );

    fireEvent.click(screen.getByText('Open Glossary'));
    expect(screen.getByPlaceholderText(/Поиск терминов/i)).toBeInTheDocument();

    // Switch to Progress tab
    fireEvent.click(screen.getByTestId('quick-nav-tab-progress'));
    expect(await screen.findByText('Прогресс завершения')).toBeInTheDocument();
    expect(screen.getByText('40%')).toBeInTheDocument();
    expect(screen.getByText(/5 дней/i)).toBeInTheDocument();

    // Switch to Roadmap tab
    fireEvent.click(screen.getByTestId('quick-nav-tab-roadmap'));
    expect(await screen.findByText('Траектория обучения')).toBeInTheDocument();
    expect(screen.getByText(/День 1: Введение и JWT аутентификация/i)).toBeInTheDocument();
    expect(screen.getByText(/День 2: Rate Limiting через Bucket4j/i)).toBeInTheDocument();
  });

  it('filters glossary terms in GlossaryView by search keyword and category pill', async () => {
    renderWithProviders(
      <>
        <TestController />
        <QuickNavDrawer />
      </>
    );

    fireEvent.click(screen.getByText('Open Glossary'));

    const searchInput = screen.getByPlaceholderText(/Поиск терминов/i);
    expect(screen.getByText(/JWT \(JSON Web Token\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Bucket4j/i)).toBeInTheDocument();

    // Search for "Bucket4j"
    fireEvent.change(searchInput, { target: { value: 'Bucket4j' } });
    expect(screen.getByText(/Bucket4j \(Token Bucket Rate Limiting\)/i)).toBeInTheDocument();
    expect(screen.queryByText(/Feature-Sliced Design \(FSD\)/i)).not.toBeInTheDocument();

    // Clear search
    fireEvent.change(searchInput, { target: { value: '' } });
    expect(screen.getByText(/Feature-Sliced Design \(FSD\)/i)).toBeInTheDocument();

    // Click Category pill "Безопасность"
    fireEvent.click(screen.getByText('Безопасность'));
    expect(screen.getByText(/JWT \(JSON Web Token\)/i)).toBeInTheDocument();
    expect(screen.queryByText(/Feature-Sliced Design \(FSD\)/i)).not.toBeInTheDocument();
  });

  it('expands term card on click, displays explanation and allows copying code snippet', async () => {
    renderWithProviders(
      <>
        <TestController />
        <QuickNavDrawer />
      </>
    );

    fireEvent.click(screen.getByText('Open Glossary'));

    const jwtCard = screen.getByTestId('glossary-card-jwt');
    fireEvent.click(jwtCard.querySelector('div')!);

    // Check expanded details
    expect(screen.getByText(/Spring Security JWT Filter validation/i)).toBeInTheDocument();
    const copyButton = screen.getByLabelText('Копировать код');
    expect(copyButton).toBeInTheDocument();

    // Click copy button
    fireEvent.click(copyButton);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.stringContaining('extractTokenFromCookie'));
    expect(await screen.findByText('Скопировано')).toBeInTheDocument();
  });

  it('deep-links to term from LessonContextPanel into QuickNav drawer with pre-expanded term', async () => {
    renderWithProviders(
      <>
        <LessonContextPanel dayNumber={1} courseId={1} lessonId={101} />
        <QuickNavDrawer />
      </>
    );

    // Find term chip in LessonContextPanel
    const chips = screen.getAllByRole('button');
    const jwtChip = chips.find((b) => b.textContent?.includes('JWT'));
    expect(jwtChip).toBeDefined();

    // Click chip
    fireEvent.click(jwtChip!);

    // Drawer should open and display JWT term
    const drawer = screen.getByTestId('quick-nav-drawer');
    expect(drawer.className).toContain('translate-x-0');
    expect(screen.getAllByText(/JWT \(JSON Web Token\)/i).length).toBeGreaterThan(1);
    expect(screen.getByTestId('glossary-card-jwt')).toBeInTheDocument();
  });
});

