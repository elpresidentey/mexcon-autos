import type { ButtonHTMLAttributes } from 'react';

export interface SwitchProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: string;
  size?: 'sm' | 'md';
}

export const Switch = ({
  checked,
  onCheckedChange,
  label,
  size = 'md',
  'aria-label': ariaLabel,
  disabled,
  className = '',
  ...props
}: SwitchProps) => {
  const sizeClasses = {
    sm: 'h-5 w-9',
    md: 'h-6 w-11',
  };

  const thumbClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
  };

  const translateClasses = {
    sm: checked ? 'translate-x-4' : 'translate-x-0.5',
    md: checked ? 'translate-x-5' : 'translate-x-0.5',
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label ?? ariaLabel ?? 'Toggle switch'}
      disabled={disabled}
      onClick={() => onCheckedChange?.(!checked)}
      className={`inline-flex shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${
        checked ? 'bg-primary-600' : 'bg-metallic-300'
      } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      <span
        className={`inline-block rounded-full bg-white shadow transition-transform ${thumbClasses[size]} ${translateClasses[size]}`}
      />
    </button>
  );
};