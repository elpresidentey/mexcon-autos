import { useState, useRef } from 'react';
import type { DragEvent, ChangeEvent } from 'react';
import { validateImageFile } from '../../utils/validation';
import { uploadImage, STORAGE_BUCKETS } from '../../services/supabase';

export interface UploadedImage {
  id: string;
  file?: File;
  url: string;
  path: string;
  preview?: string;
}

export interface ImageUploaderProps {
  maxFiles?: number;
  maxSizeMB?: number;
  acceptedTypes?: string[];
  bucket?: string;
  storagePath?: string;
  onUploadStart?: (file: File) => void;
  onUploadSuccess?: (image: UploadedImage) => void;
  onUploadError?: (file: File, error: string) => void;
  onMaxFilesReached?: () => void;
  disabled?: boolean;
  currentCount?: number;
  className?: string;
}

export const ImageUploader = ({
  maxFiles = 10,
  maxSizeMB = 5,
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  bucket = STORAGE_BUCKETS.PRODUCTS,
  storagePath = '',
  onUploadStart,
  onUploadSuccess,
  onUploadError,
  onMaxFilesReached,
  disabled = false,
  currentCount = 0,
  className = '',
}: ImageUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const remainingSlots = maxFiles - currentCount;

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Use existing validation
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return validation;
    }

    // Additional size check if custom maxSizeMB is provided
    if (file.size > maxSizeMB * 1024 * 1024) {
      return {
        valid: false,
        error: `File size exceeds ${maxSizeMB}MB limit.`,
      };
    }

    // Type check if custom acceptedTypes is provided
    if (!acceptedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Invalid file type. Accepted: ${acceptedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')}`,
      };
    }

    return { valid: true };
  };

  const processFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);

    // Check if adding these files would exceed the limit
    if (fileArray.length > remainingSlots) {
      onMaxFilesReached?.();
      alert(`You can only upload ${remainingSlots} more image(s). Maximum ${maxFiles} images allowed.`);
      return;
    }

    setUploading(true);

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      setUploadProgress(`Uploading ${i + 1} of ${fileArray.length}...`);

      // Validate file
      const validation = validateFile(file);
      if (!validation.valid) {
        onUploadError?.(file, validation.error || 'Invalid file');
        continue;
      }

      // Notify upload start
      onUploadStart?.(file);

      try {
        // Upload to Supabase Storage
        const result = await uploadImage(bucket, file, storagePath);

        if (!result) {
          onUploadError?.(file, 'Upload failed. Please try again.');
          continue;
        }

        // Create uploaded image object
        const uploadedImage: UploadedImage = {
          id: crypto.randomUUID(),
          file,
          url: result.url,
          path: result.path,
        };

        // Notify success
        onUploadSuccess?.(uploadedImage);
      } catch (error) {
        console.error('Upload error:', error);
        onUploadError?.(file, 'An error occurred during upload.');
      }
    }

    setUploading(false);
    setUploadProgress('');

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && remainingSlots > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || remainingSlots <= 0) {
      return;
    }

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  };

  const handleClick = () => {
    if (!disabled && remainingSlots > 0) {
      fileInputRef.current?.click();
    }
  };

  const isDisabled = disabled || remainingSlots <= 0;

  return (
    <div className={`w-full ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        disabled={isDisabled}
        aria-label="Upload images"
      />

      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`
          relative border-2 border-dashed rounded-lg p-8 transition-all cursor-pointer
          ${
            isDragging
              ? 'border-primary-500 bg-primary-50 scale-[1.02]'
              : isDisabled
              ? 'border-stone-200 bg-stone-50 cursor-not-allowed opacity-60'
              : 'border-stone-300 bg-stone-50 hover:border-primary-400 hover:bg-primary-50'
          }
        `}
        role="button"
        tabIndex={isDisabled ? -1 : 0}
        aria-label="Image upload area"
        aria-disabled={isDisabled}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        {uploading ? (
          <div className="text-center">
            <div className="spinner w-12 h-12 border-primary-600 mx-auto" />
            <p className="mt-4 text-sm font-medium text-stone-700">{uploadProgress}</p>
            <p className="text-xs text-stone-500 mt-1">Please wait...</p>
          </div>
        ) : (
          <div className="text-center">
            <svg
              className={`mx-auto h-12 w-12 ${isDisabled ? 'text-stone-300' : 'text-stone-400'}`}
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="mt-4">
              <p className={`text-sm ${isDisabled ? 'text-stone-400' : 'text-stone-600'}`}>
                <span className={`font-semibold ${isDisabled ? 'text-stone-400' : 'text-primary-600'}`}>
                  Click to upload
                </span>{' '}
                or drag and drop
              </p>
              <p className="text-xs text-stone-500 mt-1">
                {acceptedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')} up to {maxSizeMB}MB
              </p>
              <p className="text-xs text-stone-600 mt-2 font-medium">
                {remainingSlots > 0 ? (
                  <>
                    {remainingSlots} of {maxFiles} images remaining
                  </>
                ) : (
                  <>Maximum {maxFiles} images reached</>
                )}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
