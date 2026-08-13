import { Toaster } from 'react-hot-toast';
import type { ToastPosition } from 'react-hot-toast';

export interface ToastViewportProps {
  position?: ToastPosition;
  className?: string;
}

/** Brand-styled host for all toasts. Mount once at the app root
 *  (see src/components/layout/Layout.tsx). */
export const ToastViewport = ({ position = 'top-right', className }: ToastViewportProps) => {
  return (
    <Toaster
      position={position}
      gutter={10}
      containerClassName={className}
      toastOptions={{
        duration: 4000,
        style: {
          background: '#ffffff',
          color: '#0f172a',
          borderRadius: '0.75rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 12px 32px -8px rgba(15, 23, 42, 0.16)',
          fontSize: '0.875rem',
          fontWeight: 500,
          padding: '0.625rem 1rem',
          maxWidth: '24rem',
        },
        success: {
          iconTheme: {
            primary: '#16a34a',
            secondary: '#ffffff',
          },
        },
        error: {
          iconTheme: {
            primary: '#dc2626',
            secondary: '#ffffff',
          },
        },
      }}
    />
  );
};
