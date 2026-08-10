import { useState } from 'react';
import type { DragEvent } from 'react';
import { ImagePreview } from './ImagePreview';
import { ImageUploader } from './ImageUploader';
import type { UploadedImage } from './ImageUploader';
import { deleteImage } from '../../services/supabase';

export interface ImageGalleryImage {
  id: string;
  url: string;
  path: string;
  alt?: string;
}

export interface ImageGalleryProps {
  images: ImageGalleryImage[];
  onChange: (images: ImageGalleryImage[]) => void;
  maxImages?: number;
  bucket?: string;
  storagePath?: string;
  onUploadError?: (file: File, error: string) => void;
  onDeleteError?: (image: ImageGalleryImage, error: string) => void;
  disabled?: boolean;
  showUploader?: boolean;
  className?: string;
}

export const ImageGallery = ({
  images,
  onChange,
  maxImages = 10,
  bucket = 'products',
  storagePath = '',
  onUploadError,
  onDeleteError,
  disabled = false,
  showUploader = true,
  className = '',
}: ImageGalleryProps) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const handleDragStart = (e: DragEvent<HTMLDivElement>, index: number) => {
    if (disabled) return;
    setDraggedIndex(index);
    e.dataTransfer?.setData('text/html', e.currentTarget.innerHTML);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (disabled || draggedIndex === null) return;
    
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    if (disabled || draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newImages = [...images];
    const [draggedItem] = newImages.splice(draggedIndex, 1);
    newImages.splice(dropIndex, 0, draggedItem);

    onChange(newImages);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleUploadSuccess = (uploadedImage: UploadedImage) => {
    const newImage: ImageGalleryImage = {
      id: uploadedImage.id,
      url: uploadedImage.url,
      path: uploadedImage.path,
      alt: `Product image ${images.length + 1}`,
    };
    onChange([...images, newImage]);
  };

  const handleDelete = async (image: ImageGalleryImage) => {
    // Add to deleting set to show loading state
    setDeletingIds(prev => new Set(prev).add(image.id));

    try {
      // Delete from Supabase Storage
      const success = await deleteImage(bucket, image.path);

      if (!success) {
        throw new Error('Failed to delete image from storage');
      }

      // Remove from local state
      onChange(images.filter(img => img.id !== image.id));
    } catch (error) {
      console.error('Delete error:', error);
      onDeleteError?.(image, 'Failed to delete image. Please try again.');
    } finally {
      // Remove from deleting set
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(image.id);
        return newSet;
      });
    }
  };

  const handleMaxFilesReached = () => {
    alert(`Maximum ${maxImages} images allowed per product.`);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.map((image, index) => (
            <div
              key={image.id}
              draggable={!disabled && !deletingIds.has(image.id)}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`
                relative rounded-lg overflow-hidden transition-all
                ${!disabled && !deletingIds.has(image.id) ? 'cursor-move' : ''}
                ${draggedIndex === index ? 'opacity-50 scale-95' : ''}
                ${dragOverIndex === index && draggedIndex !== index ? 'ring-2 ring-primary-500 scale-105' : ''}
                ${index === 0 ? 'ring-2 ring-amber-400' : ''}
              `}
              style={{ aspectRatio: '1' }}
            >
              {/* Primary badge for first image */}
              {index === 0 && (
                <div className="absolute top-2 left-2 z-10 bg-amber-500 text-white text-xs font-semibold px-2 py-1 rounded shadow-lg">
                  Primary
                </div>
              )}

              {/* Drag handle indicator */}
              {!disabled && !deletingIds.has(image.id) && (
                <div className="absolute top-2 right-2 z-10 bg-white bg-opacity-80 rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg
                    className="w-4 h-4 text-stone-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 8h16M4 16h16"
                    />
                  </svg>
                </div>
              )}

              <ImagePreview
                src={image.url}
                alt={image.alt || `Product image ${index + 1}`}
                onDelete={disabled ? undefined : () => handleDelete(image)}
                className="h-full"
                showActions={!disabled}
                loading={deletingIds.has(image.id)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {images.length === 0 && (
        <div className="text-center py-12 bg-stone-50 rounded-lg border-2 border-dashed border-stone-200">
          <svg
            className="mx-auto h-12 w-12 text-stone-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="mt-2 text-sm font-medium text-stone-700">No images yet</p>
          <p className="text-xs text-stone-500 mt-1">Upload images to get started</p>
        </div>
      )}

      {/* Upload section */}
      {showUploader && (
        <div className="space-y-2">
          <ImageUploader
            maxFiles={maxImages}
            bucket={bucket}
            storagePath={storagePath}
            onUploadSuccess={handleUploadSuccess}
            onUploadError={onUploadError}
            onMaxFilesReached={handleMaxFilesReached}
            disabled={disabled || images.length >= maxImages}
            currentCount={images.length}
          />

          {/* Helper text */}
          <div className="flex items-start gap-2 text-xs text-stone-600 bg-primary-50 border border-primary-200 rounded p-3">
            <svg
              className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="font-medium">Tips:</p>
              <ul className="list-disc list-inside mt-1 space-y-0.5">
                <li>The first image will be the primary product image</li>
                <li>Drag and drop to reorder images</li>
                <li>Maximum {maxImages} images per product</li>
                <li>Supported formats: JPEG, PNG, WebP (max 5MB each)</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Image count indicator */}
      {images.length > 0 && (
        <p className="text-sm text-stone-600 text-center">
          {images.length} of {maxImages} images uploaded
        </p>
      )}
    </div>
  );
};
