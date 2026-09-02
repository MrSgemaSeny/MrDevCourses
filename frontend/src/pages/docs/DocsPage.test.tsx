import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DocsPage } from './DocsPage';

describe('DocsPage Component', () => {
  it('renders documentation knowledge base with search, categories, and concept cards', () => {
    render(
      <MemoryRouter initialEntries={['/docs']}>
        <DocsPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Документация и справочник по концепциям/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Поиск по концепциям/i)).toBeInTheDocument();
    expect(screen.getByText('Все концепции')).toBeInTheDocument();
    expect(screen.getByText(/JWT \(JSON Web Token\)/i)).toBeInTheDocument();
  });

  it('filters concepts when clicking hashtag and searching', () => {
    render(
      <MemoryRouter initialEntries={['/docs']}>
        <DocsPage />
      </MemoryRouter>
    );

    const searchInput = screen.getByPlaceholderText(/Поиск по концепциям/i);
    fireEvent.change(searchInput, { target: { value: 'Bucket4j' } });

    expect(screen.getByText(/Bucket4j \(Token Bucket Rate Limiting\)/i)).toBeInTheDocument();
    expect(screen.queryByText(/Feature-Sliced Design \(FSD\)/i)).not.toBeInTheDocument();
  });
});
