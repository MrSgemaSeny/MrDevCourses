import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { App } from './App';

describe('App Component', () => {
  it('renders header with brand link and nav', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByRole('link', { name: /MrDev\s*Courses/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Курсы/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Войти/i })).toBeInTheDocument();
  });
});
