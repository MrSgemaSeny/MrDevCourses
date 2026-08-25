import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { GoogleLoginButton } from './ui/GoogleLoginButton';

describe('GoogleLoginButton', () => {
  it('renders with default label', () => {
    render(<GoogleLoginButton />);
    expect(screen.getByRole('button', { name: /Войти через Google/i })).toBeInTheDocument();
  });

  it('renders with custom label', () => {
    render(<GoogleLoginButton text="Custom Google Login" />);
    expect(screen.getByRole('button', { name: /Custom Google Login/i })).toBeInTheDocument();
  });

  it('redirects to Google OAuth2 URL on click', () => {
    const originalLocation = window.location;
    // @ts-expect-error Mocking window.location
    delete window.location;
    window.location = { ...originalLocation, href: '' } as Location;

    render(<GoogleLoginButton />);
    fireEvent.click(screen.getByRole('button', { name: /Войти через Google/i }));

    expect(window.location.href).toBe('/api/oauth2/authorization/google');

    window.location = originalLocation;
  });
});
