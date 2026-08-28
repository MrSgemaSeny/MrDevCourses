import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { LoginPage } from './LoginPage';
import * as authFeature from '@/features/auth';

vi.mock('@/features/auth', () => ({
  useAuth: vi.fn(),
  GoogleLoginButton: ({ text }: { text?: string }) => <button>{text || 'Google Button'}</button>,
  EmailAuthForm: () => <div data-testid="email-auth-form" />,
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

describe('LoginPage', () => {
  it('renders login page with title and login button for guest', () => {
    vi.mocked(authFeature.useAuth).mockReturnValue(mockAuth());

    render(
      <MemoryRouter initialEntries={['/auth']}>
        <LoginPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Вход в MrDev/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Войти через Google/i })).toBeInTheDocument();
    expect(screen.getByTestId('email-auth-form')).toBeInTheDocument();
  });

  it('displays error message from search params if present', () => {
    vi.mocked(authFeature.useAuth).mockReturnValue(mockAuth());

    render(
      <MemoryRouter initialEntries={['/auth?error=OAuth2%20Authentication%20Failed']}>
        <LoginPage />
      </MemoryRouter>
    );

    expect(screen.getByText('OAuth2 Authentication Failed')).toBeInTheDocument();
  });

  it('redirects to /courses if already authenticated', () => {
    vi.mocked(authFeature.useAuth).mockReturnValue(
      mockAuth({
        user: { id: 1, email: 'user@test.com', role: 'STUDENT', createdAt: '2026-08-25T10:00:00Z' },
        isAuthenticated: true,
      })
    );

    render(
      <MemoryRouter initialEntries={['/auth']}>
        <Routes>
          <Route path="/auth" element={<LoginPage />} />
          <Route path="/courses" element={<div>Courses Page After Redirect</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Courses Page After Redirect')).toBeInTheDocument();
  });
});
