import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { YouTubeValidator, extractYouTubeId } from './YouTubeValidator';

describe('YouTubeValidator', () => {
  it('extracts youtube id correctly from various url formats', () => {
    expect(extractYouTubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(extractYouTubeId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(extractYouTubeId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(extractYouTubeId('invalid-url')).toBeNull();
  });

  it('renders input and shows valid embed preview iframe when url is valid', () => {
    const onChange = vi.fn();
    render(<YouTubeValidator url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" onChange={onChange} />);

    expect(screen.getByPlaceholderText(/https:\/\/www\.youtube\.com\/watch/i)).toBeInTheDocument();
    expect(screen.getByTitle('YouTube Preview')).toBeInTheDocument();
    expect(screen.getByText(/Предпросмотр видео \(ID: dQw4w9WgXcQ\)/i)).toBeInTheDocument();
  });

  it('calls onChange when user types url', () => {
    const onChange = vi.fn();
    render(<YouTubeValidator url="" onChange={onChange} />);

    const input = screen.getByPlaceholderText(/https:\/\/www\.youtube\.com\/watch/i);
    fireEvent.change(input, { target: { value: 'https://youtu.be/test1234567' } });

    expect(onChange).toHaveBeenCalledWith('https://youtu.be/test1234567');
  });

  it('shows error warning when url is invalid and non-empty', () => {
    const onChange = vi.fn();
    render(<YouTubeValidator url="invalid-link-text" onChange={onChange} />);

    expect(screen.getByText(/Укажите корректный URL видео YouTube/i)).toBeInTheDocument();
    expect(screen.queryByTitle('YouTube Preview')).not.toBeInTheDocument();
  });
});
