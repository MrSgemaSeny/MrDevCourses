import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { App } from './App';
import * as authFeature from '@/features/auth';

vi.mock('@/features/auth', () => ({
  useAuth: vi.fn(),
  AuthContextProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const mockAuth = (overrides = {}) => ({
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  isLoading: false,
  loginWithGoogle: vi.fn(),
  loginWithEmail: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  checkAuth: vi.fn(),
  ...overrides,
});

describe('App Component', () => {
  it('renders header with brand link and login button when unauthenticated', () => {
    vi.mocked(authFeature.useAuth).mockReturnValue(mockAuth());

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    expect(screen.getAllByRole('link', { name: /MrDeveloper\s*Courses/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole('link', { name: /Каталог курсов/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('link', { name: /Войти/i })).toBeInTheDocument();
  });

  it('renders dashboard link and user info when authenticated as student', () => {
    vi.mocked(authFeature.useAuth).mockReturnValue(
      mockAuth({
        user: { id: 1, email: 'student@example.com', name: 'Murat', role: 'STUDENT', createdAt: '2026-08-25T10:00:00Z' },
        isAuthenticated: true,
        isAdmin: false,
      })
    );

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    expect(screen.getAllByRole('link', { name: /Моё обучение/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByRole('link', { name: /Админ-панель/i })).not.toBeInTheDocument();
    expect(screen.getByText('Murat')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Профиль пользователя/i })).toBeInTheDocument();
  });

  it('renders admin link when authenticated as admin', () => {
    vi.mocked(authFeature.useAuth).mockReturnValue(
      mockAuth({
        user: { id: 99, email: 'admin@example.com', name: 'Admin Murat', role: 'ADMIN', createdAt: '2026-08-25T10:00:00Z' },
        isAuthenticated: true,
        isAdmin: true,
      })
    );

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    expect(screen.getAllByRole('link', { name: /Моё обучение/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('link', { name: /Админ-панель/i })).toBeInTheDocument();
    expect(screen.getByText('Admin Murat')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Профиль пользователя/i })).toBeInTheDocument();
  });
});
