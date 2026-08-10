import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders children text', () => {
    render(<Badge>Featured</Badge>);
    expect(screen.getByText('Featured')).toBeInTheDocument();
  });

  it('applies primary variant by default', () => {
    const { container } = render(<Badge>Test</Badge>);
    const badge = container.querySelector('.badge-primary');
    expect(badge).toBeInTheDocument();
  });

  it('applies success variant', () => {
    const { container } = render(<Badge variant="success">Active</Badge>);
    const badge = container.querySelector('.badge-success');
    expect(badge).toBeInTheDocument();
  });

  it('applies warning variant', () => {
    const { container } = render(<Badge variant="warning">Pending</Badge>);
    const badge = container.querySelector('.badge-warning');
    expect(badge).toBeInTheDocument();
  });

  it('applies error variant', () => {
    const { container } = render(<Badge variant="error">Error</Badge>);
    const badge = container.querySelector('.badge-danger');
    expect(badge).toBeInTheDocument();
  });

  it('applies medium size by default', () => {
    const { container } = render(<Badge>Test</Badge>);
    const badge = container.querySelector('.text-sm');
    expect(badge).toBeInTheDocument();
  });

  it('applies small size', () => {
    const { container } = render(<Badge size="sm">Small</Badge>);
    const badge = container.querySelector('.text-xs');
    expect(badge).toBeInTheDocument();
  });

  it('applies large size', () => {
    const { container } = render(<Badge size="lg">Large</Badge>);
    const badge = container.querySelector('.text-base');
    expect(badge).toBeInTheDocument();
  });

  it('accepts custom className', () => {
    const { container } = render(<Badge className="custom-class">Test</Badge>);
    const badge = container.querySelector('.custom-class');
    expect(badge).toBeInTheDocument();
  });
});
