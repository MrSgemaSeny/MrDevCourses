import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProjectsPage } from './ProjectsPage';
import { AuthContext } from '@/features/auth/model/authContext';

vi.mock('@/entities/project/api/projectApi', () => ({
  projectApi: {
    getAllProjects: vi.fn().mockResolvedValue([
      {
        id: 1,
        userId: 10,
        title: 'Habit Tracker Pro',
        description: 'Трекер привычек на React 19',
        liveDemoUrl: 'https://habit.vercel.app',
        githubRepoUrl: 'https://github.com/student/habit',
        authorName: 'Murat Graduate',
        techStack: 'React 19, Vite, Tailwind CSS',
        featured: true,
        likesCount: 12,
        createdAt: '2026-08-31T10:00:00Z',
      },
    ]),
    createProject: vi.fn(),
    likeProject: vi.fn(),
  },
}));

describe('ProjectsPage Component', () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  it('renders showcase header and project cards', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider
          value={{
            user: { id: 1, name: 'Mentor', email: 'admin@mrdev.com', role: 'ADMIN' as any, createdAt: '2026-08-31T00:00:00Z' },
            isAuthenticated: true,
            isAdmin: true,
            isLoading: false,
            loginWithGoogle: vi.fn(),
            loginWithEmail: vi.fn(),
            register: vi.fn(),
            logout: vi.fn(),
            checkAuth: vi.fn(),
          }}
        >
          <ProjectsPage />
        </AuthContext.Provider>
      </QueryClientProvider>
    );

    expect(screen.getByText(/Стена проектов выпускников/i)).toBeInTheDocument();
    expect(screen.getByText('Добавить свой проект')).toBeInTheDocument();

    const projectTitle = await screen.findByText('Habit Tracker Pro');
    expect(projectTitle).toBeInTheDocument();
    expect(screen.getByText('Murat Graduate')).toBeInTheDocument();
    expect(screen.getByText('Live Demo')).toBeInTheDocument();
  });
});
