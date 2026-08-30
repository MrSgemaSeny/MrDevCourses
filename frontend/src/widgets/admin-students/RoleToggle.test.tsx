import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RoleToggle } from './RoleToggle';

describe('RoleToggle', () => {
  it('renders STUDENT role badge and opens confirmation modal on click', async () => {
    const handleRoleChange = vi.fn().mockResolvedValue(undefined);

    render(
      <RoleToggle
        userId={10}
        userEmail="student@test.com"
        currentRole="STUDENT"
        onRoleChange={handleRoleChange}
      />
    );

    const button = screen.getByRole('button', { name: /student/i });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);

    expect(screen.getByText('Подтверждение смены роли RBAC')).toBeInTheDocument();
    expect(screen.getByText(/student@test.com/)).toBeInTheDocument();

    const confirmBtn = screen.getByRole('button', { name: /подтвердить/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(handleRoleChange).toHaveBeenCalledWith('ADMIN');
    });
  });

  it('renders ADMIN role and prevents self-demotion when isCurrentAdmin is true', () => {
    const handleRoleChange = vi.fn();

    render(
      <RoleToggle
        userId={1}
        userEmail="admin@test.com"
        currentRole="ADMIN"
        isCurrentAdmin={true}
        onRoleChange={handleRoleChange}
      />
    );

    const button = screen.getByRole('button', { name: /admin/i });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('title', 'Нельзя понизить собственную роль администратора');

    fireEvent.click(button);
    expect(screen.queryByText('Подтверждение смены роли RBAC')).not.toBeInTheDocument();
  });
});
