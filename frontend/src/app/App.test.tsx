import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { App } from './App';
import * as authFeature from '@/features/auth';

vi.mock('@/features/auth', () => ({
  useAuth: vi.fn(),
  AuthContextProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('App Component', () => {
  it('renders header with brand link and login button when unauthenticated', () => {
    vi.mocked(authFeature.useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      isLoading: false,
      loginWithGoogle: vi.fn(),
      logout: vi.fn(),
      checkAuth: vi.fn(),
    });

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByRole('link', { name: /MrDev\s*Courses/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Курсы/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Войти/i })).toBeInTheDocument();
  });

  it('renders dashboard link and user info when authenticated as student', () => {
    vi.mocked(authFeature.useAuth).mockReturnValue({
      user: { id: 1, email: 'student@example.com', name: 'Murat', role: 'STUDENT', createdAt: '2026-08-25T10:00:00Z' },
      isAuthenticated: true,
      isAdmin: false,
      isLoading: false,
      loginWithGoogle: vi.fn(),
      logout: vi.fn(),
      checkAuth: vi.fn(),
    });

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: /Моё обучение/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Админка/i })).not.toBeInTheDocument();
    expect(screen.getByText('Murat')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Выйти/i })).toBeInTheDocument();
  });

  it('renders admin link when authenticated as admin', () => {
    vi.mocked(authFeature.useAuth).mockReturnValue({
      user: { id: 99, email: 'admin@example.com', name: 'Admin Murat', role: 'ADMIN', createdAt: '2026-08-25T10:00:00Z' },
      isAuthenticated: true,
      isAdmin: true,
      isLoading: false,
      loginWithGoogle: vi.fn(),
      logout: vi.fn(),
      checkAuth: vi.fn(),
    });

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: /Моё обучение/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Админка/i })).toBeInTheDocument();
    expect(screen.getByText('Admin Murat')).toBeInTheDocument();
  });
});
