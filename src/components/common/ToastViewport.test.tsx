import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ToastViewport } from './ToastViewport';

vi.mock('react-hot-toast', () => ({
  Toaster: ({ position }: { position?: string }) => (
    <div data-testid="toaster" data-position={position ?? ''} />
  ),
}));

describe('ToastViewport', () => {
  it('renders the toast host with top-right position by default', () => {
    render(<ToastViewport />);
    const toaster = screen.getByTestId('toaster');
    expect(toaster).toBeInTheDocument();
    expect(toaster).toHaveAttribute('data-position', 'top-right');
  });

  it('accepts a custom position', () => {
    render(<ToastViewport position="bottom-center" />);
    expect(screen.getByTestId('toaster')).toHaveAttribute('data-position', 'bottom-center');
  });
});
