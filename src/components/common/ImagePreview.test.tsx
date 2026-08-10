import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ImagePreview } from './ImagePreview';

describe('ImagePreview', () => {
  const mockImage = {
    src: 'https://example.com/image.jpg',
    alt: 'Test image',
  };

  it('renders image with correct src and alt', () => {
    render(<ImagePreview {...mockImage} />);
    const img = screen.getByAltText('Test image');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', mockImage.src);
  });

  it('shows action buttons on hover when showActions is true', () => {
    render(<ImagePreview {...mockImage} showActions={true} />);
    
    const viewButton = screen.getByLabelText('View image');
    expect(viewButton).toBeInTheDocument();
  });

  it('hides action buttons when showActions is false', () => {
    render(<ImagePreview {...mockImage} showActions={false} />);
    
    expect(screen.queryByLabelText('View image')).not.toBeInTheDocument();
  });

  it('calls onDelete when delete button is clicked and confirmed', async () => {
    const mockOnDelete = vi.fn();
    const mockConfirm = vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<ImagePreview {...mockImage} onDelete={mockOnDelete} />);
    
    const deleteButton = screen.getByLabelText('Delete image');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockConfirm).toHaveBeenCalled();
      expect(mockOnDelete).toHaveBeenCalled();
    });

    mockConfirm.mockRestore();
  });

  it('does not call onDelete when deletion is cancelled', async () => {
    const mockOnDelete = vi.fn();
    const mockConfirm = vi.spyOn(window, 'confirm').mockReturnValue(false);

    render(<ImagePreview {...mockImage} onDelete={mockOnDelete} />);
    
    const deleteButton = screen.getByLabelText('Delete image');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockConfirm).toHaveBeenCalled();
      expect(mockOnDelete).not.toHaveBeenCalled();
    });

    mockConfirm.mockRestore();
  });

  it('opens modal when view button is clicked', async () => {
    render(<ImagePreview {...mockImage} />);
    
    const viewButton = screen.getByLabelText('View image');
    fireEvent.click(viewButton);

    await waitFor(() => {
      // Modal should be open with the image title
      expect(screen.getByText('Test image')).toBeInTheDocument();
    });
  });

  it('shows loading state when loading prop is true', () => {
    render(<ImagePreview {...mockImage} loading={true} />);
    
    const spinner = document.querySelector('.spinner');
    expect(spinner).toBeInTheDocument();
  });

  it('hides actions during loading', () => {
    render(<ImagePreview {...mockImage} loading={true} showActions={true} />);
    
    expect(screen.queryByLabelText('View image')).not.toBeInTheDocument();
  });

  it('shows error state when image fails to load', () => {
    render(<ImagePreview {...mockImage} />);
    
    const img = screen.getByAltText('Test image');
    fireEvent.error(img);

    expect(screen.getByText('Failed to load image')).toBeInTheDocument();
  });

  it('does not show delete button when onDelete is not provided', () => {
    render(<ImagePreview {...mockImage} showActions={true} />);
    
    expect(screen.queryByLabelText('Delete image')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <ImagePreview {...mockImage} className="custom-class" />
    );
    
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('custom-class');
  });

  it('has proper accessibility attributes for action buttons', () => {
    render(<ImagePreview {...mockImage} onDelete={vi.fn()} />);
    
    const viewButton = screen.getByLabelText('View image');
    expect(viewButton).toHaveAttribute('type', 'button');
    expect(viewButton).toHaveAttribute('aria-label', 'View image');
    expect(viewButton).toHaveAttribute('title', 'View full size');

    const deleteButton = screen.getByLabelText('Delete image');
    expect(deleteButton).toHaveAttribute('type', 'button');
    expect(deleteButton).toHaveAttribute('aria-label', 'Delete image');
    expect(deleteButton).toHaveAttribute('title', 'Delete image');
  });

  it('uses lazy loading for images', () => {
    render(<ImagePreview {...mockImage} />);
    
    const img = screen.getByAltText('Test image');
    expect(img).toHaveAttribute('loading', 'lazy');
  });
});
