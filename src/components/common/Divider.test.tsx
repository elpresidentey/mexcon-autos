import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Divider } from './Divider';

describe('Divider', () => {
  it('renders a horizontal separator by default', () => {
    const { container } = render(<Divider />);
    const separator = container.querySelector('[role="separator"]');
    expect(separator).toBeInTheDocument();
    expect(separator).toHaveClass('h-px');
  });

  it('renders a vertical separator', () => {
    const { container } = render(<Divider orientation="vertical" />);
    const separator = container.querySelector('[role="separator"]');
    expect(separator).toHaveAttribute('aria-orientation', 'vertical');
    expect(separator).toHaveClass('w-px');
  });

  it('renders the label for a labeled divider', () => {
    render(<Divider label="OR" />);
    expect(screen.getByText('OR')).toBeInTheDocument();
  });
});
