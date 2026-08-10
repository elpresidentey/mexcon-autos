import { useState } from 'react';
import { Modal } from './Modal';

export interface ImagePreviewProps {
  src: string;
  alt: string;
  onDelete?: () => void;
  className?: string;
  showActions?: boolean;
  loading?: boolean;
}

export const ImagePreview = ({
  src,
  alt,
  onDelete,
  className = '',
  showActions = true,
  loading = false,
}: ImagePreviewProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleView = () => {
    setIsModalOpen(true);
  };

  const handleDelete = () => {
    if (onDelete && window.confirm('Are you sure you want to delete this image?')) {
      onDelete();
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  if (imageError) {
    return (
      <div
        className={`relative group rounded-lg overflow-hidden border-2 border-stone-200 bg-stone-100 flex items-center justify-center ${className}`}
        style={{ minHeight: '150px' }}
      >
        <div className="text-center p-4">
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
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="text-sm text-stone-500 mt-2">Failed to load image</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`relative group rounded-lg overflow-hidden border-2 border-stone-200 ${className}`}>
        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <div className="spinner w-8 h-8 border-primary-600" />
          </div>
        )}

        {/* Image */}
        <img
          src={src}
          alt={alt}
          onError={handleImageError}
          className="w-full h-full object-cover"
          loading="lazy"
        />

        {/* Action buttons - shown on hover */}
        {showActions && !loading && (
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            {/* View button */}
            <button
              type="button"
              onClick={handleView}
              className="w-11 h-11 flex items-center justify-center bg-white rounded-full shadow-lg hover:bg-primary-50 transition-colors"
              aria-label="View image"
              title="View full size"
            >
              <svg
                className="w-5 h-5 text-stone-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </button>

            {/* Delete button */}
            {onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className="w-11 h-11 flex items-center justify-center bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors"
                aria-label="Delete image"
                title="Delete image"
              >
                <svg
                  className="w-5 h-5 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Full-size image modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={alt || 'Image Preview'}
        size="lg"
      >
        <div className="flex items-center justify-center bg-stone-100 rounded-lg p-4">
          <img
            src={src}
            alt={alt}
            className="max-w-full max-h-[70vh] object-contain"
          />
        </div>
      </Modal>
    </>
  );
};
