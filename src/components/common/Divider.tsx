import type { HTMLAttributes } from 'react';

export interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  label?: string;
  className?: string;
}

/** Separator line; optionally with a centered label. */
export const Divider = ({
  orientation = 'horizontal',
  label,
  className = '',
  ...props
}: DividerProps) => {
  if (orientation === 'vertical') {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        className={`w-px self-stretch bg-line ${className}`}
        {...props}
      />
    );
  }

  if (label) {
    return (
      <div role="separator" className={`flex w-full items-center gap-3 ${className}`} {...props}>
        <span className="h-px flex-1 bg-line" />
        <span className="text-xs font-semibold uppercase tracking-wider text-ink-subtle">
          {label}
        </span>
        <span className="h-px flex-1 bg-line" />
      </div>
    );
  }

  return (
    <div role="separator" className={`h-px w-full bg-line ${className}`} {...props} />
  );
};