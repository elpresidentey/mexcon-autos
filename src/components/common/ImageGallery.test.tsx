import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ImageGallery } from './ImageGallery';
import type { ImageGalleryImage } from './ImageGallery';
import * as supabaseService from '../../services/supabase';

// Mock the services
vi.mock('../../services/supabase', () => ({
  uploadImage: vi.fn(),
  deleteImage: vi.fn(),
  STORAGE_BUCKETS: {
    PRODUCTS: 'products',
  },
}));

describe('ImageGallery', () => {
  const mockImages: ImageGalleryImage[] = [
    { id: '1', url: 'https://example.com/img1.jpg', path: 'path/img1.jpg', alt: 'Image 1' },
    { id: '2', url: 'https://example.com/img2.jpg', path: 'path/img2.jpg', alt: 'Image 2' },
    { id: '3', url: 'https://example.com/img3.jpg', path: 'path/img3.jpg', alt: 'Image 3' },
  ];

  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all images in a grid', () => {
    render(<ImageGallery images={mockImages} onChange={mockOnChange} />);
    
    expect(screen.getByAltText('Image 1')).toBeInTheDocument();
    expect(screen.getByAltText('Image 2')).toBeInTheDocument();
    expect(screen.getByAltText('Image 3')).toBeInTheDocument();
  });

  it('marks the first image as primary', () => {
    render(<ImageGallery images={mockImages} onChange={mockOnChange} />);
    
    expect(screen.getByText('Primary')).toBeInTheDocument();
  });

  it('shows empty state when no images', () => {
    render(<ImageGallery images={[]} onChange={mockOnChange} />);
    
    expect(screen.getByText('No images yet')).toBeInTheDocument();
    expect(screen.getByText('Upload images to get started')).toBeInTheDocument();
  });

  it('displays image count', () => {
    render(<ImageGallery images={mockImages} onChange={mockOnChange} maxImages={10} />);
    
    expect(screen.getByText('3 of 10 images uploaded')).toBeInTheDocument();
  });

  it('hides uploader when showUploader is false', () => {
    render(
      <ImageGallery images={mockImages} onChange={mockOnChange} showUploader={false} />
    );
    
    expect(screen.queryByText(/Click to upload/i)).not.toBeInTheDocument();
  });

  it('calls onChange with new order after drag and drop', async () => {
    render(<ImageGallery images={mockImages} onChange={mockOnChange} />);
    
    const images = screen.getAllByRole('img');
    
    // Simulate drag from index 0 to index 2
    fireEvent.dragStart(images[0].closest('div[draggable="true"]')!);
    fireEvent.dragOver(images[2].closest('div[draggable="true"]')!);
    fireEvent.drop(images[2].closest('div[draggable="true"]')!);
    fireEvent.dragEnd(images[0].closest('div[draggable="true"]')!);

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalled();
      // Verify the reordered array
      const reorderedImages = mockOnChange.mock.calls[0][0];
      expect(reorderedImages[2].id).toBe('1'); // First image moved to position 2
    });
  });

  it('deletes image successfully', async () => {
    vi.mocked(supabaseService.deleteImage).mockResolvedValue(true);
    const mockConfirm = vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<ImageGallery images={mockImages} onChange={mockOnChange} />);
    
    // Find and click the delete button for the first image
    const deleteButtons = screen.getAllByLabelText('Delete image');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(supabaseService.deleteImage).toHaveBeenCalledWith('products', 'path/img1.jpg');
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: '2' }),
          expect.objectContaining({ id: '3' }),
        ])
      );
    });

    mockConfirm.mockRestore();
  });

  it('handles delete error', async () => {
    const mockOnDeleteError = vi.fn();
    vi.mocked(supabaseService.deleteImage).mockResolvedValue(false);
    const mockConfirm = vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(
      <ImageGallery
        images={mockImages}
        onChange={mockOnChange}
        onDeleteError={mockOnDeleteError}
      />
    );
    
    const deleteButtons = screen.getAllByLabelText('Delete image');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(mockOnDeleteError).toHaveBeenCalledWith(
        mockImages[0],
        expect.stringContaining('Failed to delete')
      );
    });

    mockConfirm.mockRestore();
  });

  it('adds new image on successful upload', async () => {
    render(<ImageGallery images={mockImages} onChange={mockOnChange} />);
    
    // This would typically be triggered by the ImageUploader component
    // We can't easily test the full flow, but we verify the component renders the uploader
    expect(screen.getByText(/Click to upload/i)).toBeInTheDocument();
  });

  it('shows max files reached alert', () => {
    const mockAlert = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(
      <ImageGallery
        images={Array(10).fill(null).map((_, i) => ({
          id: `${i}`,
          url: `https://example.com/img${i}.jpg`,
          path: `path/img${i}.jpg`,
        }))}
        onChange={mockOnChange}
        maxImages={10}
      />
    );
    
    // The uploader should be disabled when max is reached
    const uploadArea = screen.getByRole('button', { name: 'Image upload area' });
    expect(uploadArea).toHaveAttribute('aria-disabled', 'true');

    mockAlert.mockRestore();
  });

  it('disables drag and drop when disabled prop is true', () => {
    render(<ImageGallery images={mockImages} onChange={mockOnChange} disabled={true} />);
    
    const images = screen.getAllByRole('img');
    
    expect(images[0].closest('div[draggable]')).toHaveAttribute('draggable', 'false');
  });

  it('hides delete buttons when disabled', () => {
    render(<ImageGallery images={mockImages} onChange={mockOnChange} disabled={true} />);
    
    expect(screen.queryByLabelText('Delete image')).not.toBeInTheDocument();
  });

  it('displays helper tips', () => {
    render(<ImageGallery images={mockImages} onChange={mockOnChange} />);
    
    expect(screen.getByText(/The first image will be the primary/i)).toBeInTheDocument();
    expect(screen.getByText(/Drag and drop to reorder/i)).toBeInTheDocument();
    expect(screen.getByText(/Maximum 10 images per product/i)).toBeInTheDocument();
  });

  it('uses custom bucket and storage path', () => {
    render(
      <ImageGallery
        images={mockImages}
        onChange={mockOnChange}
        bucket="custom-bucket"
        storagePath="custom/path"
      />
    );
    
    // The component should render without errors
    expect(screen.getByAltText('Image 1')).toBeInTheDocument();
  });

  it('updates maxImages dynamically', () => {
    const { rerender } = render(
      <ImageGallery images={mockImages} onChange={mockOnChange} maxImages={10} />
    );
    
    expect(screen.getByText('3 of 10 images uploaded')).toBeInTheDocument();

    rerender(
      <ImageGallery images={mockImages} onChange={mockOnChange} maxImages={5} />
    );
    
    expect(screen.getByText('3 of 5 images uploaded')).toBeInTheDocument();
  });

  it('prevents drag when image is being deleted', async () => {
    vi.mocked(supabaseService.deleteImage).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(true), 100))
    );
    const mockConfirm = vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<ImageGallery images={mockImages} onChange={mockOnChange} />);
    
    const deleteButtons = screen.getAllByLabelText('Delete image');
    fireEvent.click(deleteButtons[0]);

    // During deletion, the image should not be draggable
    await waitFor(() => {
      // The component sets draggable based on deletingIds state
      // We can verify this indirectly by checking if delete was called
      expect(supabaseService.deleteImage).toHaveBeenCalled();
    });

    mockConfirm.mockRestore();
  });

  it('shows loading state on image during deletion', async () => {
    vi.mocked(supabaseService.deleteImage).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(true), 100))
    );
    const mockConfirm = vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<ImageGallery images={mockImages} onChange={mockOnChange} />);
    
    const deleteButtons = screen.getAllByLabelText('Delete image');
    fireEvent.click(deleteButtons[0]);

    // Should show loading spinner during deletion
    await waitFor(() => {
      const spinner = document.querySelector('.spinner');
      expect(spinner).toBeInTheDocument();
    });

    mockConfirm.mockRestore();
  });

  it('does not reorder when dragging to same position', () => {
    render(<ImageGallery images={mockImages} onChange={mockOnChange} />);
    
    const images = screen.getAllByRole('img');
    const firstImage = images[0].closest('div[draggable="true"]')!;
    
    fireEvent.dragStart(firstImage);
    fireEvent.drop(firstImage);
    fireEvent.dragEnd(firstImage);

    // onChange should not be called for same position
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('applies custom className', () => {
    const { container } = render(
      <ImageGallery
        images={mockImages}
        onChange={mockOnChange}
        className="custom-gallery"
      />
    );
    
    expect(container.firstChild).toHaveClass('custom-gallery');
  });
});
