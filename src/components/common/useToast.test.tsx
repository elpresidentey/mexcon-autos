import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const mocks = vi.hoisted(() => ({
  toast: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
  dismiss: vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
  default: Object.assign(mocks.toast, {
    success: mocks.success,
    error: mocks.error,
    dismiss: mocks.dismiss,
  }),
  Toaster: () => null,
}));

import { useToast } from './useToast';

describe('useToast', () => {
  it('returns a stable toast API', () => {
    const { result } = renderHook(() => useToast());
    expect(result.current.success).toBeTypeOf('function');
    expect(result.current.error).toBeTypeOf('function');
    expect(result.current.info).toBeTypeOf('function');
    expect(result.current.warning).toBeTypeOf('function');
    expect(result.current.dismiss).toBeTypeOf('function');
  });

  it('fires themed calls', () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.success('Done');
      result.current.error('Boom');
      result.current.info('Note');
      result.current.warning('Careful');
    });
    expect(mocks.success).toHaveBeenCalledWith('Done', expect.any(Object));
    expect(mocks.error).toHaveBeenCalledWith('Boom', expect.any(Object));
    expect(mocks.toast).toHaveBeenCalledTimes(2);
  });
});
