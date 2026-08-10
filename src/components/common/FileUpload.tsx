import type { InputHTMLAttributes, ChangeEvent } from 'react';
import { forwardRef, useState } from 'react';
import { validateImageFile } from '../../utils/validation';

interface FileUploadProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  label?: string;
  error?: string;
  helperText?: string;
  maxSizeMB?: number;
  acceptedTypes?: string[];
  showPreview?: boolean;
  onChange?: (file: File | null, error?: string) => void;
}

export const FileUpload = forwardRef<HTMLInputElement, FileUploadProps>(
  (
    {
      label,
      error,
      helperText,
      maxSizeMB = 5,
      acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      showPreview = true,
      className = '',
      onChange,
      ...props
    },
    ref
  ) => {
    const [preview, setPreview] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string>('');
    const [validationError, setValidationError] = useState<string>('');

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;

      if (!file) {
        setPreview(null);
        setFileName('');
        setValidationError('');
        onChange?.(null);
        return;
      }

      // Validate file
      const validation = validateImageFile(file);
      
      if (!validation.valid) {
        setValidationError(validation.error || 'Invalid file');
        setPreview(null);
        setFileName('');
        onChange?.(null, validation.error);
        return;
      }

      // Additional size check if custom maxSizeMB is provided
      if (file.size > maxSizeMB * 1024 * 1024) {
        const sizeError = `File size exceeds ${maxSizeMB}MB limit.`;
        setValidationError(sizeError);
        setPreview(null);
        setFileName('');
        onChange?.(null, sizeError);
        return;
      }

      // Type check if custom acceptedTypes is provided
      if (!acceptedTypes.includes(file.type)) {
        const typeError = `Invalid file type. Accepted: ${acceptedTypes.join(', ')}`;
        setValidationError(typeError);
        setPreview(null);
        setFileName('');
        onChange?.(null, typeError);
        return;
      }

      // File is valid
      setValidationError('');
      setFileName(file.name);
      onChange?.(file);

      // Create preview for images
      if (showPreview && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    };

    const handleClear = () => {
      setPreview(null);
      setFileName('');
      setValidationError('');
      onChange?.(null);
      if (ref && 'current' in ref && ref.current) {
        ref.current.value = '';
      }
    };

    const displayError = error || validationError;

    return (
      <div className="w-full">
        {label && (
          <label className="label" htmlFor={props.id}>
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="space-y-3">
          {/* File Input */}
          <div className="relative">
            <input
              ref={ref}
              type="file"
              accept={acceptedTypes.join(',')}
              className="hidden"
              onChange={handleFileChange}
              {...props}
            />
            <label
              htmlFor={props.id}
              className={`flex items-center justify-center w-full px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
                displayError
                  ? 'border-red-500 bg-red-50'
                  : 'border-stone-300 bg-stone-50 hover:bg-stone-100 hover:border-primary-400'
              } ${className}`}
            >
              <div className="text-center">
                <svg
                  className="mx-auto h-12 w-12 text-stone-400"
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
                <div className="mt-2 text-sm text-stone-600">
                  <span className="font-semibold text-primary-600">Click to upload</span> or drag and drop
                </div>
                <p className="text-xs text-stone-500 mt-1">
                  {acceptedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')} up to {maxSizeMB}MB
                </p>
              </div>
            </label>
          </div>

          {/* File Name Display */}
          {fileName && (
            <div className="flex items-center justify-between p-3 bg-primary-50 border border-primary-200 rounded-lg">
              <div className="flex items-center space-x-2 min-w-0">
                <svg
                  className="h-5 w-5 text-primary-600 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm text-stone-700 truncate">{fileName}</span>
              </div>
              <button
                type="button"
                onClick={handleClear}
                className="ml-2 text-stone-400 hover:text-red-600 transition-colors flex-shrink-0"
                aria-label="Clear file"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          )}

          {/* Image Preview */}
          {showPreview && preview && (
            <div className="relative rounded-lg overflow-hidden border border-stone-200">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-48 object-cover"
              />
            </div>
          )}
        </div>

        {displayError && <p className="error-message">{displayError}</p>}
        {helperText && !displayError && (
          <p className="text-sm text-metallic-600 mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

FileUpload.displayName = 'FileUpload';
