import type { InputHTMLAttributes } from 'react';
import { forwardRef } from 'react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              ref={ref}
              type="checkbox"
              className={`w-4 h-4 text-primary-600 bg-white border-stone-300 rounded focus:ring-primary-500 focus:ring-2 transition-all ${
                error ? 'border-red-500' : ''
              } ${className}`}
              {...props}
            />
          </div>
          {label && (
            <div className="ml-3 text-sm">
              <label htmlFor={props.id} className="font-medium text-stone-700 cursor-pointer">
                {label}
                {props.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {helperText && !error && (
                <p className="text-metallic-600">{helperText}</p>
              )}
            </div>
          )}
        </div>
        {error && <p className="error-message ml-7">{error}</p>}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
