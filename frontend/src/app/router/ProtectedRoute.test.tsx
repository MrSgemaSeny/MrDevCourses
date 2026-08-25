import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import * as authFeature from '@/features/auth';

vi.mock('@/features/auth', () => ({
  useAuth: vi.fn(),
}));

describe('ProtectedRoute', () => {
  it('shows loading spinner when isLoading is true', () => {
    vi.mocked(authFeature.useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      isLoading: true,
      loginWithGoogle: vi.fn(),
      logout: vi.fn(),
      checkAuth: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('redirects to /auth when unauthenticated', () => {
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
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/auth" element={<div>Auth Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Auth Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders children when authenticated', () => {
    vi.mocked(authFeature.useAuth).mockReturnValue({
      user: { id: 1, email: 'user@test.com', role: 'STUDENT', createdAt: '2026-08-25T10:00:00Z' },
      isAuthenticated: true,
      isAdmin: false,
      isLoading: false,
      loginWithGoogle: vi.fn(),
      logout: vi.fn(),
      checkAuth: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <ProtectedRoute>
          <div>Protected Student Dashboard</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Protected Student Dashboard')).toBeInTheDocument();
  });

  it('redirects student to /courses when accessing adminOnly route', () => {
    vi.mocked(authFeature.useAuth).mockReturnValue({
      user: { id: 1, email: 'student@test.com', role: 'STUDENT', createdAt: '2026-08-25T10:00:00Z' },
      isAuthenticated: true,
      isAdmin: false,
      isLoading: false,
      loginWithGoogle: vi.fn(),
      logout: vi.fn(),
      checkAuth: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <div>Admin Panel Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/courses" element={<div>Courses Catalog Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Courses Catalog Page')).toBeInTheDocument();
    expect(screen.queryByText('Admin Panel Content')).not.toBeInTheDocument();
  });

  it('allows admin access to adminOnly route', () => {
    vi.mocked(authFeature.useAuth).mockReturnValue({
      user: { id: 99, email: 'admin@test.com', role: 'ADMIN', createdAt: '2026-08-25T10:00:00Z' },
      isAuthenticated: true,
      isAdmin: true,
      isLoading: false,
      loginWithGoogle: vi.fn(),
      logout: vi.fn(),
      checkAuth: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <ProtectedRoute adminOnly>
          <div>Admin Panel Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Admin Panel Content')).toBeInTheDocument();
  });
});
