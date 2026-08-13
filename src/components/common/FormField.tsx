import type { ReactNode } from 'react';

export interface FormFieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  children: ReactNode;
}

/** Labelled form control wrapper with hint + error messaging.
 *  Pass `htmlFor` matching the control's `id` to make the label clickable. */
export const FormField = ({
  label,
  htmlFor,
  required = false,
  hint,
  error,
  className = '',
  children,
}: FormFieldProps) => {
  return (
    <div className={className}>
      <label className="label" htmlFor={htmlFor}>
        {label}
        {required && <span className="text-red-600 ml-1">*</span>}
      </label>
      {children}
      {error ? (
        <p className="error-message" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1 text-sm text-ink-subtle">{hint}</p>
      ) : null}
    </div>
  );
};