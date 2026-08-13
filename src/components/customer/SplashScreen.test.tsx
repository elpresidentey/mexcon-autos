import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { SplashScreen } from './SplashScreen';

describe('SplashScreen', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows the brand wordmark and guarantee tagline', () => {
    vi.useFakeTimers();
    render(<SplashScreen onComplete={() => {}} />);
    expect(screen.getByText(/MEXTECH/)).toBeInTheDocument();
    expect(screen.getByText(/guarantee you the best quality/i)).toBeInTheDocument();
  });

  it('calls onComplete after the splash duration', () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();
    render(<SplashScreen onComplete={onComplete} />);
    act(() => {
      vi.advanceTimersByTime(2500);
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});