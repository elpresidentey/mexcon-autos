import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  as?: 'button' | 'a' | 'span' | 'label';
  href?: string;
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  as = 'button',
  href,
  ...props
}: ButtonProps) => {
  const baseStyles = 'btn';
  
  const variantStyles = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
    danger: 'btn-danger',
  };

  const sizeStyles = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
  };

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  const content = (
    <>
      {isLoading && (
        <div className="spinner w-4 h-4 mr-2" />
      )}
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </>
  );

  if (as === 'a' && href) {
    return (
      <a href={href} className={combinedClassName} {...(props as any)}>
        {content}
      </a>
    );
  }

  if (as === 'span' || as === 'label') {
    const Tag = as;
    return (
      <Tag className={combinedClassName} {...(props as any)}>
        {content}
      </Tag>
    );
  }

  return (
    <button
      className={combinedClassName}
      disabled={disabled || isLoading}
      {...props}
    >
      {content}
    </button>
  );
};
