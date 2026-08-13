import hotToast from 'react-hot-toast';
import { createElement } from 'react';
import type { ReactElement } from 'react';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

export interface ToastOptions {
  id?: string;
  duration?: number;
  icon?: ReactElement | string;
}

const baseStyle = {
  background: '#ffffff',
  color: '#0f172a',
  borderRadius: '0.75rem',
  border: '1px solid #e2e8f0',
  boxShadow: '0 12px 32px -8px rgba(15, 23, 42, 0.16)',
  fontSize: '0.875rem',
  fontWeight: 500,
  padding: '0.625rem 1rem',
  maxWidth: '24rem',
} as const;

const mergeOptions = (opts?: ToastOptions) => ({
  id: opts?.id,
  duration: opts?.duration ?? 4000,
  style: baseStyle,
});

/** Brand-themed toast API built on react-hot-toast. */
export const toast = {
  success: (message: string, opts?: ToastOptions) =>
    hotToast.success(message, {
      ...mergeOptions(opts),
      icon: opts?.icon ?? createElement(CheckCircleIcon, { className: 'h-5 w-5 text-primary-600' }),
    }),

  error: (message: string, opts?: ToastOptions) =>
    hotToast.error(message, {
      ...mergeOptions(opts),
      icon: opts?.icon ?? createElement(XCircleIcon, { className: 'h-5 w-5 text-red-600' }),
    }),

  info: (message: string, opts?: ToastOptions) =>
    hotToast(message, {
      ...mergeOptions(opts),
      icon: opts?.icon ?? createElement(InformationCircleIcon, { className: 'h-5 w-5 text-metallic-500' }),
    }),

  warning: (message: string, opts?: ToastOptions) =>
    hotToast(message, {
      ...mergeOptions(opts),
      icon: opts?.icon ?? createElement(ExclamationTriangleIcon, { className: 'h-5 w-5 text-amber-500' }),
    }),

  dismiss: (id?: string) => hotToast.dismiss(id),
};
