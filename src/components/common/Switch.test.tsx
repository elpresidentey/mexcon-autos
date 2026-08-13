import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Switch } from './Switch';

describe('Switch', () => {
  it('renders with switch role and reflects checked state', () => {
    render(<Switch checked />);
    const switchEl = screen.getByRole('switch');
    expect(switchEl).toHaveAttribute('aria-checked', 'true');
  });

  it('fires onCheckedChange with the next value on click', () => {
    let nextValue: boolean | undefined;
    render(<Switch checked={false} onCheckedChange={(value) => { nextValue = value; }} />);
    fireEvent.click(screen.getByRole('switch'));
    expect(nextValue).toBe(true);
  });

  it('uses the label as the accessible name', () => {
    render(<Switch checked label="Notifications" />);
    expect(screen.getByRole('switch', { name: 'Notifications' })).toBeInTheDocument();
  });

  it('does not fire when disabled', () => {
    let fired = false;
    render(<Switch checked={false} disabled onCheckedChange={() => { fired = true; }} />);
    fireEvent.click(screen.getByRole('switch'));
    expect(fired).toBe(false);
  });
});
