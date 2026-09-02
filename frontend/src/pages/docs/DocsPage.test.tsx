import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DocsPage } from './DocsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

describe('DocsPage Component', () => {
  it('renders documentation knowledge base with search, categories, and concept cards', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/docs']}>
          <DocsPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText(/Документация и справочник по концепциям/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Поиск по концепциям/i)).toBeInTheDocument();
    expect(screen.getByText('Все концепции')).toBeInTheDocument();
    expect(screen.getByText(/JWT \(JSON Web Token\)/i)).toBeInTheDocument();
  });

  it('filters concepts when clicking hashtag and searching', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/docs']}>
          <DocsPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    const searchInput = screen.getByPlaceholderText(/Поиск по концепциям/i);
    fireEvent.change(searchInput, { target: { value: 'Bucket4j' } });

    expect(screen.getByText(/Bucket4j \(Token Bucket Rate Limiting\)/i)).toBeInTheDocument();
    expect(screen.queryByText(/Feature-Sliced Design \(FSD\)/i)).not.toBeInTheDocument();
  });
});
