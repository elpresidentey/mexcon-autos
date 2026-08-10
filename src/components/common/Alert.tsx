import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon, 
  XCircleIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';

interface AlertProps {
  severity?: 'info' | 'success' | 'warning' | 'error';
  message: string;
  onClose?: () => void;
  closable?: boolean;
  className?: string;
}

export const Alert = ({
  severity = 'info',
  message,
  onClose,
  closable = false,
  className = '',
}: AlertProps) => {
  const icons = {
    info: InformationCircleIcon,
    success: CheckCircleIcon,
    warning: ExclamationTriangleIcon,
    error: XCircleIcon,
  };

  const styles = {
    info: 'bg-primary-50 text-primary-800 border-primary-200',
    success: 'bg-green-50 text-green-800 border-green-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    error: 'bg-red-50 text-red-800 border-red-200',
  };

  const iconStyles = {
    info: 'text-primary-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600',
  };

  const Icon = icons[severity];

  return (
    <div
      className={`flex items-start p-4 border rounded-lg ${styles[severity]} ${className}`}
      role="alert"
      aria-live="polite"
    >
      <Icon className={`h-5 w-5 mt-0.5 mr-3 flex-shrink-0 ${iconStyles[severity]}`} aria-hidden="true" />
      
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
      </div>
      
      {closable && onClose && (
        <button
          type="button"
          onClick={onClose}
          className="ml-3 inline-flex flex-shrink-0 hover:opacity-75 transition-opacity min-w-[2.75rem] min-h-[2.75rem] items-center justify-center"
          aria-label="Close alert"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};
