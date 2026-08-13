import { describe, it, expect, vi } from 'vitest';

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

import { toast } from './toast';

describe('toast', () => {
  it('success passes a message with brand styling', () => {
    toast.success('Saved');
    expect(mocks.success).toHaveBeenCalledWith('Saved', expect.objectContaining({ duration: 4000 }));
  });

  it('error passes a message with brand styling', () => {
    toast.error('Failed');
    expect(mocks.error).toHaveBeenCalledWith('Failed', expect.objectContaining({ duration: 4000 }));
  });

  it('info uses the raw toast function with a default icon', () => {
    toast.info('Heads up');
    expect(mocks.toast).toHaveBeenCalledWith(
      'Heads up',
      expect.objectContaining({ duration: 4000 }),
    );
    const options = mocks.toast.mock.calls[0][1];
    expect(options.icon).toBeTruthy();
  });

  it('warning uses the raw toast function', () => {
    toast.warning('Careful');
    expect(mocks.toast).toHaveBeenCalledWith('Careful', expect.any(Object));
  });

  it('respects custom options', () => {
    toast.success('Slow', { duration: 7000, id: 'custom-id' });
    expect(mocks.success).toHaveBeenCalledWith('Slow', expect.objectContaining({ duration: 7000, id: 'custom-id' }));
  });

  it('dismisses by id', () => {
    toast.dismiss('custom-id');
    expect(mocks.dismiss).toHaveBeenCalledWith('custom-id');
  });
});
