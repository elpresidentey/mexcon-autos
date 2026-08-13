import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormField } from './FormField';

describe('FormField', () => {
  it('renders label linked to the control id', () => {
    render(
      <FormField label="Product name" htmlFor="product-name">
        <input id="product-name" />
      </FormField>,
    );
    expect(screen.getByLabelText('Product name')).toBeInTheDocument();
  });

  it('omits htmlFor when not provided', () => {
    render(
      <FormField label="Quantity">
        <input />
      </FormField>,
    );
    expect(screen.getByText('Quantity')).not.toHaveAttribute('for');
  });

  it('shows required marker', () => {
    render(
      <FormField label="Email" required htmlFor="email">
        <input id="email" />
      </FormField>,
    );
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('shows an error with alert role', () => {
    render(
      <FormField label="Name" error="Name is required" htmlFor="name">
        <input id="name" />
      </FormField>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Name is required');
  });

  it('shows a hint when no error', () => {
    render(
      <FormField label="Name" hint="As shown on your ID" htmlFor="name">
        <input id="name" />
      </FormField>,
    );
    expect(screen.getByText('As shown on your ID')).toBeInTheDocument();
  });

  it('hides the hint when an error is present', () => {
    render(
      <FormField label="Name" hint="As shown on your ID" error="Too short" htmlFor="name">
        <input id="name" />
      </FormField>,
    );
    expect(screen.queryByText('As shown on your ID')).not.toBeInTheDocument();
  });
});
