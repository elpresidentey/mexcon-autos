import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Tooltip } from './Tooltip';

describe('Tooltip', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('renders children', () => {
    render(
      <Tooltip content="Helpful text">
        <button>Hover me</button>
      </Tooltip>
    );
    expect(screen.getByText('Hover me')).toBeInTheDocument();
  });

  it('shows tooltip on mouse enter after delay', async () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>
    );

    const button = screen.getByText('Hover me');
    
    act(() => {
      fireEvent.mouseEnter(button);
    });
    
    // Fast-forward time past the delay
    await act(async () => {
      vi.advanceTimersByTime(250);
    });
    
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    expect(screen.getByText('Tooltip text')).toBeInTheDocument();
  });

  it('hides tooltip on mouse leave', async () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>
    );

    const button = screen.getByText('Hover me');
    
    act(() => {
      fireEvent.mouseEnter(button);
    });
    
    await act(async () => {
      vi.advanceTimersByTime(250);
    });
    
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    act(() => {
      fireEvent.mouseLeave(button);
    });
    
    const tooltip = screen.queryByRole('tooltip');
    expect(tooltip).toHaveClass('opacity-0');
  });

  it('shows tooltip on focus', async () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Focus me</button>
      </Tooltip>
    );

    const button = screen.getByText('Focus me');
    
    act(() => {
      fireEvent.focus(button);
    });
    
    await act(async () => {
      vi.advanceTimersByTime(250);
    });
    
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });

  it('hides tooltip on blur', async () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Focus me</button>
      </Tooltip>
    );

    const button = screen.getByText('Focus me');
    
    act(() => {
      fireEvent.focus(button);
    });
    
    await act(async () => {
      vi.advanceTimersByTime(250);
    });
    
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    act(() => {
      fireEvent.blur(button);
    });
    
    const tooltip = screen.queryByRole('tooltip');
    expect(tooltip).toHaveClass('opacity-0');
  });

  it('applies correct position class for top', async () => {
    render(
      <Tooltip content="Top tooltip" position="top">
        <button>Hover me</button>
      </Tooltip>
    );

    const button = screen.getByText('Hover me');
    
    act(() => {
      fireEvent.mouseEnter(button);
    });
    
    await act(async () => {
      vi.advanceTimersByTime(250);
    });
    
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveClass('bottom-full');
  });

  it('applies correct position class for bottom', async () => {
    render(
      <Tooltip content="Bottom tooltip" position="bottom">
        <button>Hover me</button>
      </Tooltip>
    );

    const button = screen.getByText('Hover me');
    
    act(() => {
      fireEvent.mouseEnter(button);
    });
    
    await act(async () => {
      vi.advanceTimersByTime(250);
    });
    
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveClass('top-full');
  });

  it('applies correct position class for left', async () => {
    render(
      <Tooltip content="Left tooltip" position="left">
        <button>Hover me</button>
      </Tooltip>
    );

    const button = screen.getByText('Hover me');
    
    act(() => {
      fireEvent.mouseEnter(button);
    });
    
    await act(async () => {
      vi.advanceTimersByTime(250);
    });
    
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveClass('right-full');
  });

  it('applies correct position class for right', async () => {
    render(
      <Tooltip content="Right tooltip" position="right">
        <button>Hover me</button>
      </Tooltip>
    );

    const button = screen.getByText('Hover me');
    
    act(() => {
      fireEvent.mouseEnter(button);
    });
    
    await act(async () => {
      vi.advanceTimersByTime(250);
    });
    
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveClass('left-full');
  });
});
