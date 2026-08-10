import type { ReactNode } from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode | {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState = ({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) => {
  const renderAction = () => {
    if (!action) return null;
    if (typeof action === 'object' && 'label' in action && 'onClick' in action) {
      return (
        <Button onClick={action.onClick} variant="primary">
          {action.label}
        </Button>
      );
    }
    return action;
  };

  return (
    <div
      className={`flex flex-col items-center justify-center text-center py-12 px-4 ${className}`}
    >
      {icon && (
        <div className="mb-4 text-metallic-400" aria-hidden="true">
          {icon}
        </div>
      )}

      <h3 className="text-2xl font-black text-dark-900 mb-2 tracking-tight">{title}</h3>

      {description && (
        <p className="text-metallic-600 max-w-md mb-6">{description}</p>
      )}

      {renderAction()}
    </div>
  );
};
