import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { AuthProvider, useAuthContext } from './AuthProvider';
import { userApi } from '@/entities/user/api/userApi';
import type { User } from '@/entities/user/model/types';

vi.mock('@/entities/user/api/userApi', () => ({
  userApi: {
    getMe: vi.fn(),
    logout: vi.fn(),
  },
}));

const TestConsumer: React.FC = () => {
  const { user, isAuthenticated, isAdmin, isLoading, logout } = useAuthContext();
  if (isLoading) return <div>Loading session...</div>;
  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'Authenticated' : 'Guest'}</div>
      <div data-testid="admin-status">{isAdmin ? 'Admin' : 'Not Admin'}</div>
      <div data-testid="user-email">{user?.email || 'No email'}</div>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
};

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('restores authenticated user session on mount', async () => {
    const mockUser: User = {
      id: 1,
      email: 'student@mrdevcourses.com',
      name: 'Murat',
      role: 'STUDENT',
      createdAt: '2026-08-25T10:00:00Z',
    };
    vi.mocked(userApi.getMe).mockResolvedValueOnce(mockUser);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByText('Loading session...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('admin-status')).toHaveTextContent('Not Admin');
      expect(screen.getByTestId('user-email')).toHaveTextContent('student@mrdevcourses.com');
    });
  });

  it('handles unauthenticated state when getMe fails', async () => {
    vi.mocked(userApi.getMe).mockRejectedValueOnce(new Error('401 Unauthorized'));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Guest');
      expect(screen.getByTestId('admin-status')).toHaveTextContent('Not Admin');
      expect(screen.getByTestId('user-email')).toHaveTextContent('No email');
    });
  });

  it('identifies admin role correctly', async () => {
    const adminUser: User = {
      id: 99,
      email: 'admin@mrdevcourses.com',
      name: 'Admin User',
      role: 'ADMIN',
      createdAt: '2026-08-25T10:00:00Z',
    };
    vi.mocked(userApi.getMe).mockResolvedValueOnce(adminUser);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('admin-status')).toHaveTextContent('Admin');
    });
  });

  it('clears user state on logout', async () => {
    const mockUser: User = {
      id: 1,
      email: 'student@mrdevcourses.com',
      role: 'STUDENT',
      createdAt: '2026-08-25T10:00:00Z',
    };
    vi.mocked(userApi.getMe).mockResolvedValueOnce(mockUser);
    vi.mocked(userApi.logout).mockResolvedValueOnce(undefined);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    });

    await act(async () => {
      screen.getByRole('button', { name: /Logout/i }).click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Guest');
      expect(userApi.logout).toHaveBeenCalledTimes(1);
    });
  });
});
