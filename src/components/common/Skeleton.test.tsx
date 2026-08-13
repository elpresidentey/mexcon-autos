import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Skeleton, SkeletonText, SkeletonCircle } from './Skeleton';

describe('Skeleton', () => {
  it('renders a rect skeleton by default', () => {
    const { container } = render(<Skeleton className="h-40" />);
    expect(container.querySelector('.skeleton')).toBeInTheDocument();
  });

  it('applies the circle variant', () => {
    const { container } = render(<Skeleton variant="circle" className="h-10 w-10" />);
    expect(container.querySelector('.rounded-full')).toBeInTheDocument();
  });

  it('renders text lines in SkeletonText', () => {
    const { container } = render(<SkeletonText lines={4} />);
    expect(container.querySelectorAll('.skeleton')).toHaveLength(4);
  });

  it('renders a circle in SkeletonCircle', () => {
    const { container } = render(<SkeletonCircle />);
    expect(container.querySelector('.rounded-full')).toBeInTheDocument();
  });
});
