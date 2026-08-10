import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Breadcrumbs } from './Breadcrumbs';

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('Breadcrumbs', () => {
  const items = [
    { label: 'Products', href: '/products' },
    { label: 'Auto Parts', href: '/products/auto-parts' },
    { label: 'Engine Components' },
  ];

  it('renders all breadcrumb items', () => {
    renderWithRouter(<Breadcrumbs items={items} />);
    
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Auto Parts')).toBeInTheDocument();
    expect(screen.getByText('Engine Components')).toBeInTheDocument();
  });

  it('shows home icon by default', () => {
    renderWithRouter(<Breadcrumbs items={items} />);
    
    const homeLink = screen.getByLabelText('Home');
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('hides home icon when showHome is false', () => {
    renderWithRouter(<Breadcrumbs items={items} showHome={false} />);
    
    const homeLink = screen.queryByLabelText('Home');
    expect(homeLink).not.toBeInTheDocument();
  });

  it('marks last item as current page', () => {
    renderWithRouter(<Breadcrumbs items={items} />);
    
    const lastItem = screen.getByText('Engine Components');
    expect(lastItem).toHaveAttribute('aria-current', 'page');
  });

  it('renders clickable links for items with href', () => {
    renderWithRouter(<Breadcrumbs items={items} />);
    
    const productsLink = screen.getByText('Products').closest('a');
    expect(productsLink).toHaveAttribute('href', '/products');
    
    const autoPartsLink = screen.getByText('Auto Parts').closest('a');
    expect(autoPartsLink).toHaveAttribute('href', '/products/auto-parts');
  });

  it('renders last item as non-clickable', () => {
    renderWithRouter(<Breadcrumbs items={items} />);
    
    const lastItem = screen.getByText('Engine Components');
    expect(lastItem.tagName).toBe('SPAN');
  });

  it('returns null when items array is empty', () => {
    const { container } = renderWithRouter(<Breadcrumbs items={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('has proper navigation role', () => {
    renderWithRouter(<Breadcrumbs items={items} />);
    
    const nav = screen.getByRole('navigation', { name: /breadcrumb/i });
    expect(nav).toBeInTheDocument();
  });
});
