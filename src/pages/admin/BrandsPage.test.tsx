import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrandsPage } from './BrandsPage';
import { brandsService } from '../../services/brands.service';
import type { Brand } from '../../types';

// Mock the brands service
vi.mock('../../services/brands.service', () => ({
  brandsService: {
    getBrandsWithProductCounts: vi.fn(),
    getBrands: vi.fn(),
    createBrand: vi.fn(),
    updateBrand: vi.fn(),
    deleteBrand: vi.fn(),
    toggleBrandActive: vi.fn(),
  },
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockBrands: Array<Brand & { product_count: number }> = [
  {
    id: '1',
    name: 'Toyota',
    slug: 'toyota',
    description: 'Japanese automotive manufacturer',
    country: 'Japan',
    website: 'https://www.toyota.com',
    logo_url: 'https://example.com/toyota.png',
    logo_path: 'brands/toyota.png',
    is_featured: true,
    is_active: true,
    order_index: 0,
    product_count: 150,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Honda',
    slug: 'honda',
    description: 'Japanese automotive manufacturer',
    country: 'Japan',
    website: 'https://www.honda.com',
    logo_url: 'https://example.com/honda.png',
    logo_path: 'brands/honda.png',
    is_featured: false,
    is_active: true,
    order_index: 1,
    product_count: 120,
    created_at: '2024-01-02T00:00:00Z',
  },
];

describe('BrandsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page title and description', async () => {
    vi.mocked(brandsService.getBrandsWithProductCounts).mockResolvedValue(mockBrands);

    render(<BrandsPage />);

    expect(await screen.findByText('Brands')).toBeInTheDocument();
    expect(screen.getByText('Manage vehicle brands and manufacturers')).toBeInTheDocument();
  });

  it('displays loading spinner while fetching brands', () => {
    vi.mocked(brandsService.getBrandsWithProductCounts).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<BrandsPage />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('displays brands in a grid after loading', async () => {
    vi.mocked(brandsService.getBrandsWithProductCounts).mockResolvedValue(mockBrands);

    render(<BrandsPage />);

    await waitFor(() => {
      expect(screen.getByText('Toyota')).toBeInTheDocument();
      expect(screen.getByText('Honda')).toBeInTheDocument();
    });
  });

  it('displays brand information correctly', async () => {
    vi.mocked(brandsService.getBrandsWithProductCounts).mockResolvedValue(mockBrands);

    render(<BrandsPage />);

    await waitFor(() => {
      // Brand names
      expect(screen.getByText('Toyota')).toBeInTheDocument();
      
      // Brand slugs
      expect(screen.getByText('/toyota')).toBeInTheDocument();
      
      // Brand countries
      expect(screen.getAllByText('Japan')).toHaveLength(2);
      
      // Product counts
      expect(screen.getByText('150 products')).toBeInTheDocument();
      expect(screen.getByText('120 products')).toBeInTheDocument();
    });
  });

  it('displays active badge for active brands', async () => {
    vi.mocked(brandsService.getBrandsWithProductCounts).mockResolvedValue(mockBrands);

    render(<BrandsPage />);

    await waitFor(() => {
      const activeBadges = screen.getAllByText('Active');
      expect(activeBadges).toHaveLength(2);
    });
  });

  it('displays featured badge for featured brands', async () => {
    vi.mocked(brandsService.getBrandsWithProductCounts).mockResolvedValue(mockBrands);

    render(<BrandsPage />);

    await waitFor(() => {
      expect(screen.getByText('Featured')).toBeInTheDocument();
    });
  });

  it('displays add brand button', async () => {
    vi.mocked(brandsService.getBrandsWithProductCounts).mockResolvedValue(mockBrands);

    render(<BrandsPage />);

    await waitFor(() => {
      const addButtons = screen.getAllByText('Add Brand');
      expect(addButtons.length).toBeGreaterThan(0);
    });
  });

  it('opens modal when add brand button is clicked', async () => {
    const user = userEvent.setup();
    vi.mocked(brandsService.getBrandsWithProductCounts).mockResolvedValue(mockBrands);

    render(<BrandsPage />);

    await waitFor(() => {
      expect(screen.getByText('Toyota')).toBeInTheDocument();
    });

    const addButton = screen.getAllByText('Add Brand')[0];
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Add New Brand')).toBeInTheDocument();
    });
  });

  it('displays empty state when no brands exist', async () => {
    vi.mocked(brandsService.getBrandsWithProductCounts).mockResolvedValue([]);

    render(<BrandsPage />);

    await waitFor(() => {
      expect(screen.getByText('No brands found')).toBeInTheDocument();
      expect(screen.getByText('Get started by adding your first brand')).toBeInTheDocument();
    });
  });

  it('displays brand logos when available', async () => {
    vi.mocked(brandsService.getBrandsWithProductCounts).mockResolvedValue(mockBrands);

    render(<BrandsPage />);

    await waitFor(() => {
      const toyotaLogo = screen.getByAltText('Toyota');
      expect(toyotaLogo).toBeInTheDocument();
      expect(toyotaLogo).toHaveAttribute('src', 'https://example.com/toyota.png');
    });
  });

  it('displays action buttons for each brand', async () => {
    vi.mocked(brandsService.getBrandsWithProductCounts).mockResolvedValue(mockBrands);

    render(<BrandsPage />);

    await waitFor(() => {
      // Should have edit and delete buttons for each brand
      const editButtons = screen.getAllByTitle('Edit');
      const deleteButtons = screen.getAllByTitle('Delete');
      
      expect(editButtons).toHaveLength(2);
      expect(deleteButtons).toHaveLength(2);
    });
  });
});
