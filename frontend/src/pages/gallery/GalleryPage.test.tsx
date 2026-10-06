import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { GalleryPage } from './GalleryPage';

describe('GalleryPage Component', () => {
  it('renders gallery header, category filters, and image cards', () => {
    render(<GalleryPage />);

    expect(screen.getByRole('heading', { level: 1, name: 'Галерея' })).toBeInTheDocument();
    expect(screen.getByText('Медиатека платформы')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Все материалы/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Интерфейс/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Бренд и арт/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Промо и медиа/i })).toBeInTheDocument();

    // Check images exist
    expect(screen.getByText('Главная страница и видео-курс Вайбкодинг')).toBeInTheDocument();
    expect(screen.getByText('Как войти в IT-индустрию с нуля (YouTube)')).toBeInTheDocument();
    expect(screen.getByText('Как войти в IT-индустрию с нуля (Reels & Stories)')).toBeInTheDocument();
    expect(screen.getByText('Фирменный стиль и маскот Mr Developer')).toBeInTheDocument();
    expect(screen.getByText('Минималистичный логотип MrDEV')).toBeInTheDocument();
    expect(screen.getByText('Портрет маскота MrDev в рамке')).toBeInTheDocument();
    expect(screen.getByText('Графический баннер со взглядом')).toBeInTheDocument();
    expect(screen.getByText('Маскот Mr Developer в худи')).toBeInTheDocument();
  });

  it('filters gallery items when switching category tabs', () => {
    render(<GalleryPage />);

    // Switch to UI category
    fireEvent.click(screen.getByRole('button', { name: /Интерфейс/i }));
    expect(screen.getByText('Главная страница и видео-курс Вайбкодинг')).toBeInTheDocument();
    expect(screen.queryByText('Фирменный стиль и маскот Mr Developer')).not.toBeInTheDocument();

    // Switch to Promo category
    fireEvent.click(screen.getByRole('button', { name: /Промо и медиа/i }));
    expect(screen.getByText('Как войти в IT-индустрию с нуля (YouTube)')).toBeInTheDocument();
    expect(screen.getByText('Как войти в IT-индустрию с нуля (Reels & Stories)')).toBeInTheDocument();
    expect(screen.queryByText('Главная страница и видео-курс Вайбкодинг')).not.toBeInTheDocument();

    // Switch to Brand category
    fireEvent.click(screen.getByRole('button', { name: /Бренд и арт/i }));
    expect(screen.queryByText('Главная страница и видео-курс Вайбкодинг')).not.toBeInTheDocument();
    expect(screen.getByText('Фирменный стиль и маскот Mr Developer')).toBeInTheDocument();

    // Switch back to All
    fireEvent.click(screen.getByRole('button', { name: /Все материалы/i }));
    expect(screen.getByText('Главная страница и видео-курс Вайбкодинг')).toBeInTheDocument();
    expect(screen.getByText('Фирменный стиль и маскот Mr Developer')).toBeInTheDocument();
  });

  it('opens and closes image lightbox modal on click', () => {
    render(<GalleryPage />);

    // Click on preview button of the first card
    const previewButtons = screen.getAllByRole('button', { name: /Просмотр/i });
    fireEvent.click(previewButtons[0]);

    // Dialog should be open
    const modal = screen.getByRole('dialog');
    expect(modal).toBeInTheDocument();
    expect(screen.getByText('Разрешение: 1920 × 890')).toBeInTheDocument();

    // Close dialog via close button
    const closeButton = screen.getByLabelText('Закрыть окно');
    fireEvent.click(closeButton);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('navigates with keyboard arrows and closes with escape in modal', () => {
    render(<GalleryPage />);

    const previewButtons = screen.getAllByRole('button', { name: /Просмотр/i });
    fireEvent.click(previewButtons[0]);

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Navigate right to second item
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(screen.getByText('Разрешение: 1280 × 720')).toBeInTheDocument();

    // Close with Escape
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
