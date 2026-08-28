import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { UserProfileDropdown } from './UserProfileDropdown';
import * as authFeature from '@/features/auth';

vi.mock('@/features/auth', () => ({
  useAuth: vi.fn(),
}));

describe('UserProfileDropdown Component', () => {
  it('renders nothing if user is null', () => {
    vi.mocked(authFeature.useAuth).mockReturnValue({
      user: null,
      logout: vi.fn(),
    } as unknown as ReturnType<typeof authFeature.useAuth>);

    const { container } = render(
      <MemoryRouter>
        <UserProfileDropdown />
      </MemoryRouter>
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('toggles dropdown and shows user info and links on click', () => {
    const mockLogout = vi.fn();
    vi.mocked(authFeature.useAuth).mockReturnValue({
      user: {
        id: 1,
        email: 'murat@example.com',
        name: 'Murat Senior',
        role: 'STUDENT',
        currentStreak: 5,
        longestStreak: 12,
        createdAt: '2026-08-25T10:00:00Z',
      },
      logout: mockLogout,
    } as unknown as ReturnType<typeof authFeature.useAuth>);

    render(
      <MemoryRouter>
        <UserProfileDropdown />
      </MemoryRouter>
    );

    const triggerBtn = screen.getByRole('button', { name: /Профиль пользователя/i });
    expect(triggerBtn).toBeInTheDocument();

    // Click to open
    fireEvent.click(triggerBtn);

    expect(screen.getByText('murat@example.com')).toBeInTheDocument();
    expect(screen.getByText('5 дн.')).toBeInTheDocument();
    expect(screen.getByText('12 дн.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Выйти из аккаунта/i })).toBeInTheDocument();

    // Click logout
    fireEvent.click(screen.getByRole('button', { name: /Выйти из аккаунта/i }));
    expect(mockLogout).toHaveBeenCalled();
  });
});
