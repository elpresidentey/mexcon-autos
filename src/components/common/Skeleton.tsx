import type { HTMLAttributes } from 'react';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'rect' | 'circle' | 'text';
}

/** Pulsing placeholder block shown while content loads. */
export const Skeleton = ({ variant = 'rect', className = '', ...props }: SkeletonProps) => {
  const variantClasses = {
    rect: '',
    circle: 'rounded-full',
    text: 'h-3 rounded',
  };

  return (
    <div aria-hidden="true" className={`skeleton ${variantClasses[variant]} ${className}`} {...props} />
  );
};

export interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

/** A stack of text-shaped skeleton lines. */
export const SkeletonText = ({ lines = 3, className = '' }: SkeletonTextProps) => {
  const widths = ['w-full', 'w-11/12', 'w-4/5', 'w-2/3', 'w-1/2'];

  return (
    <div aria-hidden="true" className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton key={index} variant="text" className={widths[index % widths.length]} />
      ))}
    </div>
  );
};

export interface SkeletonCircleProps {
  className?: string;
}

/** A circular avatar-sized skeleton. */
export const SkeletonCircle = ({ className = '' }: SkeletonCircleProps) => (
  <Skeleton variant="circle" className={`h-12 w-12 ${className}`} />
);