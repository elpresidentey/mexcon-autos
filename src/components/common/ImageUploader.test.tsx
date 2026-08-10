import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ImageUploader } from './ImageUploader';
import * as supabaseService from '../../services/supabase';
import * as validationUtils from '../../utils/validation';

// Mock the services
vi.mock('../../services/supabase', () => ({
  uploadImage: vi.fn(),
  STORAGE_BUCKETS: {
    PRODUCTS: 'products',
    CATEGORIES: 'categories',
    BRANDS: 'brands',
  },
}));

describe('ImageUploader', () => {
  const mockFile = new File(['image'], 'test.jpg', { type: 'image/jpeg' });
  const mockUploadResult = {
    url: 'https://example.com/uploaded-image.jpg',
    path: 'uploads/test.jpg',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders upload area with correct text', () => {
    render(<ImageUploader />);
    
    expect(screen.getByText('Click to upload')).toBeInTheDocument();
    expect(screen.getByText(/drag and drop/i)).toBeInTheDocument();
  });

  it('shows remaining slots information', () => {
    render(<ImageUploader maxFiles={10} currentCount={3} />);
    
    expect(screen.getByText(/7 of 10 images remaining/i)).toBeInTheDocument();
  });

  it('shows maximum reached message when at limit', () => {
    render(<ImageUploader maxFiles={10} currentCount={10} />);
    
    expect(screen.getByText(/Maximum 10 images reached/i)).toBeInTheDocument();
  });

  it('calls onUploadSuccess when file upload succeeds', async () => {
    const mockOnUploadSuccess = vi.fn();
    vi.mocked(supabaseService.uploadImage).mockResolvedValue(mockUploadResult);
    vi.spyOn(validationUtils, 'validateImageFile').mockReturnValue({ valid: true });

    render(<ImageUploader onUploadSuccess={mockOnUploadSuccess} />);
    
    const input = screen.getByLabelText('Upload images');
    fireEvent.change(input, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(mockOnUploadSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          url: mockUploadResult.url,
          path: mockUploadResult.path,
        })
      );
    });
  });

  it('calls onUploadError when validation fails', async () => {
    const mockOnUploadError = vi.fn();
    vi.spyOn(validationUtils, 'validateImageFile').mockReturnValue({
      valid: false,
      error: 'Invalid file type',
    });

    render(<ImageUploader onUploadError={mockOnUploadError} />);
    
    const input = screen.getByLabelText('Upload images');
    fireEvent.change(input, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(mockOnUploadError).toHaveBeenCalledWith(mockFile, 'Invalid file type');
    });
  });

  it('calls onUploadError when upload fails', async () => {
    const mockOnUploadError = vi.fn();
    vi.mocked(supabaseService.uploadImage).mockResolvedValue(null);
    vi.spyOn(validationUtils, 'validateImageFile').mockReturnValue({ valid: true });

    render(<ImageUploader onUploadError={mockOnUploadError} />);
    
    const input = screen.getByLabelText('Upload images');
    fireEvent.change(input, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(mockOnUploadError).toHaveBeenCalledWith(
        mockFile,
        'Upload failed. Please try again.'
      );
    });
  });

  it('handles multiple file uploads', async () => {
    const mockOnUploadSuccess = vi.fn();
    const file1 = new File(['image1'], 'test1.jpg', { type: 'image/jpeg' });
    const file2 = new File(['image2'], 'test2.jpg', { type: 'image/jpeg' });
    
    vi.mocked(supabaseService.uploadImage).mockResolvedValue(mockUploadResult);
    vi.spyOn(validationUtils, 'validateImageFile').mockReturnValue({ valid: true });

    render(<ImageUploader onUploadSuccess={mockOnUploadSuccess} />);
    
    const input = screen.getByLabelText('Upload images');
    fireEvent.change(input, { target: { files: [file1, file2] } });

    await waitFor(() => {
      expect(mockOnUploadSuccess).toHaveBeenCalledTimes(2);
    });
  });

  it('prevents exceeding max files limit', async () => {
    const mockOnMaxFilesReached = vi.fn();
    const mockAlert = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    const files = [
      new File(['1'], 'test1.jpg', { type: 'image/jpeg' }),
      new File(['2'], 'test2.jpg', { type: 'image/jpeg' }),
      new File(['3'], 'test3.jpg', { type: 'image/jpeg' }),
    ];

    render(
      <ImageUploader
        maxFiles={5}
        currentCount={4}
        onMaxFilesReached={mockOnMaxFilesReached}
      />
    );
    
    const input = screen.getByLabelText('Upload images');
    fireEvent.change(input, { target: { files } });

    await waitFor(() => {
      expect(mockOnMaxFilesReached).toHaveBeenCalled();
      expect(mockAlert).toHaveBeenCalledWith(
        expect.stringContaining('You can only upload 1 more')
      );
    });

    mockAlert.mockRestore();
  });

  it('shows upload progress during upload', async () => {
    vi.mocked(supabaseService.uploadImage).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(mockUploadResult), 100))
    );
    vi.spyOn(validationUtils, 'validateImageFile').mockReturnValue({ valid: true });

    render(<ImageUploader />);
    
    const input = screen.getByLabelText('Upload images');
    fireEvent.change(input, { target: { files: [mockFile] } });

    // Should show uploading state
    await waitFor(() => {
      expect(screen.getByText(/Uploading 1 of 1/i)).toBeInTheDocument();
    });
  });

  it('handles drag and drop', async () => {
    const mockOnUploadSuccess = vi.fn();
    vi.mocked(supabaseService.uploadImage).mockResolvedValue(mockUploadResult);
    vi.spyOn(validationUtils, 'validateImageFile').mockReturnValue({ valid: true });

    render(<ImageUploader onUploadSuccess={mockOnUploadSuccess} />);
    
    const dropZone = screen.getByRole('button', { name: 'Image upload area' });
    
    // Simulate drag and drop
    const dataTransfer = {
      files: [mockFile],
      effectAllowed: 'move',
      dropEffect: 'move',
    };

    fireEvent.drop(dropZone, { dataTransfer });

    await waitFor(() => {
      expect(mockOnUploadSuccess).toHaveBeenCalled();
    });
  });

  it('updates UI when dragging over', () => {
    const { container } = render(<ImageUploader />);
    
    const dropZone = screen.getByRole('button', { name: 'Image upload area' });
    
    fireEvent.dragEnter(dropZone);
    
    const dropZoneElement = container.querySelector('.border-primary-500');
    expect(dropZoneElement).toBeInTheDocument();
  });

  it('disables when disabled prop is true', () => {
    render(<ImageUploader disabled={true} />);
    
    const dropZone = screen.getByRole('button', { name: 'Image upload area' });
    expect(dropZone).toHaveAttribute('aria-disabled', 'true');
  });

  it('disables when max files reached', () => {
    render(<ImageUploader maxFiles={5} currentCount={5} />);
    
    const dropZone = screen.getByRole('button', { name: 'Image upload area' });
    expect(dropZone).toHaveAttribute('aria-disabled', 'true');
  });

  it('validates file size against custom maxSizeMB', async () => {
    const mockOnUploadError = vi.fn();
    const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', {
      type: 'image/jpeg',
    });
    
    vi.spyOn(validationUtils, 'validateImageFile').mockReturnValue({ valid: true });

    render(<ImageUploader maxSizeMB={5} onUploadError={mockOnUploadError} />);
    
    const input = screen.getByLabelText('Upload images');
    fireEvent.change(input, { target: { files: [largeFile] } });

    await waitFor(() => {
      expect(mockOnUploadError).toHaveBeenCalledWith(
        largeFile,
        expect.stringContaining('exceeds 5MB')
      );
    });
  });

  it('validates against custom accepted types', async () => {
    const mockOnUploadError = vi.fn();
    const pdfFile = new File(['pdf'], 'test.pdf', { type: 'application/pdf' });
    
    vi.spyOn(validationUtils, 'validateImageFile').mockReturnValue({ valid: true });

    render(
      <ImageUploader
        acceptedTypes={['image/jpeg', 'image/png']}
        onUploadError={mockOnUploadError}
      />
    );
    
    const input = screen.getByLabelText('Upload images');
    fireEvent.change(input, { target: { files: [pdfFile] } });

    await waitFor(() => {
      expect(mockOnUploadError).toHaveBeenCalledWith(
        pdfFile,
        expect.stringContaining('Invalid file type')
      );
    });
  });

  it('calls onUploadStart when upload begins', async () => {
    const mockOnUploadStart = vi.fn();
    vi.mocked(supabaseService.uploadImage).mockResolvedValue(mockUploadResult);
    vi.spyOn(validationUtils, 'validateImageFile').mockReturnValue({ valid: true });

    render(<ImageUploader onUploadStart={mockOnUploadStart} />);
    
    const input = screen.getByLabelText('Upload images');
    fireEvent.change(input, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(mockOnUploadStart).toHaveBeenCalledWith(mockFile);
    });
  });

  it('supports keyboard interaction', () => {
    render(<ImageUploader />);
    
    const dropZone = screen.getByRole('button', { name: 'Image upload area' });
    
    // Spy on the click behavior by checking if it's focusable
    fireEvent.keyDown(dropZone, { key: 'Enter' });
    
    // Since we can't easily test the actual file input click,
    // we verify the element is keyboard accessible
    expect(dropZone).toHaveAttribute('tabIndex', '0');
  });
});
