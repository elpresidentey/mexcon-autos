import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Alert } from './Alert';

describe('Alert', () => {
  it('renders message text', () => {
    render(<Alert message="Test alert message" />);
    expect(screen.getByText('Test alert message')).toBeInTheDocument();
  });

  it('renders info severity by default', () => {
    render(<Alert message="Info message" />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('bg-primary-50');
  });

  it('renders success severity', () => {
    render(<Alert severity="success" message="Success message" />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('bg-green-50');
  });

  it('renders warning severity', () => {
    render(<Alert severity="warning" message="Warning message" />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('bg-yellow-50');
  });

  it('renders error severity', () => {
    render(<Alert severity="error" message="Error message" />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('bg-red-50');
  });

  it('shows close button when closable is true', () => {
    const onClose = vi.fn();
    render(<Alert message="Closable alert" closable onClose={onClose} />);
    
    const closeButton = screen.getByLabelText(/close alert/i);
    expect(closeButton).toBeInTheDocument();
  });

  it('hides close button when closable is false', () => {
    render(<Alert message="Non-closable alert" closable={false} />);
    
    const closeButton = screen.queryByLabelText(/close alert/i);
    expect(closeButton).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<Alert message="Test" closable onClose={onClose} />);
    
    const closeButton = screen.getByLabelText(/close alert/i);
    fireEvent.click(closeButton);
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('has appropriate aria-live attribute', () => {
    render(<Alert message="Live region test" />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'polite');
  });

  it('displays appropriate icon for each severity', () => {
    const { container, rerender } = render(<Alert severity="info" message="Info" />);
    expect(container.querySelector('svg')).toBeInTheDocument();

    rerender(<Alert severity="success" message="Success" />);
    expect(container.querySelector('svg')).toBeInTheDocument();

    rerender(<Alert severity="warning" message="Warning" />);
    expect(container.querySelector('svg')).toBeInTheDocument();

    rerender(<Alert severity="error" message="Error" />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
