import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmptyState } from './EmptyState';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';

describe('EmptyState', () => {
  it('renders title', () => {
    render(<EmptyState title="No items found" />);
    expect(screen.getByText('No items found')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(
      <EmptyState
        title="No items"
        description="Try adjusting your filters"
      />
    );
    expect(screen.getByText('Try adjusting your filters')).toBeInTheDocument();
  });

  it('does not render description when not provided', () => {
    const { container } = render(<EmptyState title="No items" />);
    const description = container.querySelector('p');
    expect(description).not.toBeInTheDocument();
  });

  it('renders custom icon when provided', () => {
    const { container } = render(
      <EmptyState
        icon={<ShoppingCartIcon className="h-16 w-16" />}
        title="Empty cart"
      />
    );
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('renders action button when provided', () => {
    const handleClick = vi.fn();
    render(
      <EmptyState
        title="No items"
        action={{
          label: 'Add Item',
          onClick: handleClick,
        }}
      />
    );
    
    const button = screen.getByText('Add Item');
    expect(button).toBeInTheDocument();
  });

  it('calls action onClick when button is clicked', () => {
    const handleClick = vi.fn();
    render(
      <EmptyState
        title="No items"
        action={{
          label: 'Add Item',
          onClick: handleClick,
        }}
      />
    );
    
    const button = screen.getByText('Add Item');
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not render action button when not provided', () => {
    render(<EmptyState title="No items" />);
    
    const button = screen.queryByRole('button');
    expect(button).not.toBeInTheDocument();
  });

  it('accepts custom className', () => {
    const { container } = render(
      <EmptyState title="No items" className="custom-empty" />
    );
    expect(container.querySelector('.custom-empty')).toBeInTheDocument();
  });
});
