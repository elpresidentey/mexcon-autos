import { useState, useEffect } from 'react';
import { supabase, STORAGE_BUCKETS } from '../../services/supabase';
import {
  Button,
  Card,
  SearchBar,
  LoadingSpinner,
  EmptyState,
  Modal,
} from '../../components/common';
import { 
  PhotoIcon, 
  TrashIcon, 
  CloudArrowUpIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface MediaFile {
  name: string;
  url: string;
  size: number;
  created_at: string;
  bucket: string;
}

export const MediaLibraryPage = () => {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    loadMedia();
  }, []);

  useEffect(() => {
    // Filter files based on search term
    if (searchTerm.trim()) {
      const filtered = files.filter((file) =>
        file.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredFiles(filtered);
    } else {
      setFilteredFiles(files);
    }
  }, [searchTerm, files]);

  const loadMedia = async () => {
    try {
      setIsLoading(true);
      const allFiles: MediaFile[] = [];

      // Fetch from media-library bucket
      const { data: mediaLibraryFiles, error: mediaLibraryError } = await supabase
        .storage
        .from(STORAGE_BUCKETS.MEDIA_LIBRARY)
        .list();

      if (mediaLibraryError) {
        console.error('Error loading media library:', mediaLibraryError);
      } else if (mediaLibraryFiles) {
        for (const file of mediaLibraryFiles) {
          if (file.name && !file.name.includes('.emptyFolderPlaceholder')) {
            const { data: publicUrl } = supabase
              .storage
              .from(STORAGE_BUCKETS.MEDIA_LIBRARY)
              .getPublicUrl(file.name);

            allFiles.push({
              name: file.name,
              url: publicUrl.publicUrl,
              size: file.metadata?.size || 0,
              created_at: file.created_at || new Date().toISOString(),
              bucket: STORAGE_BUCKETS.MEDIA_LIBRARY,
            });
          }
        }
      }

      // Sort by created date (newest first)
      allFiles.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setFiles(allFiles);
      setFilteredFiles(allFiles);
    } catch (error) {
      console.error('Error loading media:', error);
      toast.error('Failed to load media library');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setIsUploading(true);

    try {
      const uploadPromises = Array.from(selectedFiles).map(async (file) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          throw new Error(`${file.name} is not a valid image file`);
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`${file.name} exceeds 5MB size limit`);
        }

        // Generate unique filename
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 8);
        const fileExt = file.name.split('.').pop();
        const fileName = `${timestamp}-${randomString}.${fileExt}`;

        const { error } = await supabase
          .storage
          .from(STORAGE_BUCKETS.MEDIA_LIBRARY)
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (error) throw error;
      });

      await Promise.all(uploadPromises);

      toast.success(`Successfully uploaded ${selectedFiles.length} file(s)`);
      loadMedia();
    } catch (error: any) {
      console.error('Error uploading files:', error);
      toast.error(error.message || 'Failed to upload files');
    } finally {
      setIsUploading(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const handleDelete = async (file: MediaFile) => {
    if (!window.confirm(`Are you sure you want to delete "${file.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .storage
        .from(file.bucket)
        .remove([file.name]);

      if (error) throw error;

      toast.success('File deleted successfully');
      loadMedia();
    } catch (error: any) {
      console.error('Error deleting file:', error);
      toast.error(error.message || 'Failed to delete file');
    }
  };

  const openPreview = (file: MediaFile) => {
    setSelectedFile(file);
    setIsPreviewOpen(true);
  };

  const closePreview = () => {
    setSelectedFile(null);
    setIsPreviewOpen(false);
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl lg:text-4xl font-extrabold uppercase tracking-wide text-ink">Media Library</h1>
          <p className="text-metallic-600 mt-1">Manage your uploaded images and files</p>
        </div>
        <label htmlFor="media-upload">
          <input
            id="media-upload"
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            disabled={isUploading}
            className="hidden"
          />
          <Button 
            as="span"
            leftIcon={<CloudArrowUpIcon className="w-5 h-5" />}
            isLoading={isUploading}
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload Images'}
          </Button>
        </label>
      </div>

      {/* Search */}
      <Card className="p-4">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by filename..."
        />
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
              <PhotoIcon className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-metallic-600">Total Files</p>
              <p className="text-2xl font-bold text-ink">{files.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
              <PhotoIcon className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-metallic-600">Search Results</p>
              <p className="text-2xl font-bold text-ink">{filteredFiles.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <PhotoIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-metallic-600">Total Size</p>
              <p className="text-2xl font-bold text-ink">
                {formatFileSize(files.reduce((acc, file) => acc + file.size, 0))}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Media Grid */}
      {filteredFiles.length === 0 ? (
        <Card>
          <EmptyState
            title={searchTerm ? 'No files found' : 'No media files'}
            description={searchTerm ? 'Try a different search term' : 'Upload your first image to get started'}
            action={
              !searchTerm && (
                <label htmlFor="media-upload-empty">
                  <input
                    id="media-upload-empty"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                  <Button 
                    as="span"
                    leftIcon={<CloudArrowUpIcon className="w-5 h-5" />}
                    isLoading={isUploading}
                  >
                    Upload Images
                  </Button>
                </label>
              )
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredFiles.map((file) => (
            <Card key={file.url} className="group relative overflow-hidden hover:shadow-lg transition-shadow">
              {/* Image */}
              <div 
                className="aspect-square bg-metallic-100 cursor-pointer"
                onClick={() => openPreview(file)}
              >
                <img
                  src={file.url}
                  alt={file.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              {/* Overlay on Hover */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => copyToClipboard(file.url)}
                    className="p-2 bg-white rounded-lg hover:bg-metallic-100 transition-colors"
                    title="Copy URL"
                  >
                    <PhotoIcon className="w-5 h-5 text-metallic-700" />
                  </button>
                  <button
                    onClick={() => handleDelete(file)}
                    className="p-2 bg-white rounded-lg hover:bg-metallic-100 transition-colors"
                    title="Delete"
                  >
                    <TrashIcon className="w-5 h-5 text-red-600" />
                  </button>
                </div>
              </div>

              {/* File Info */}
              <div className="p-3">
                <p className="text-xs text-ink font-medium truncate" title={file.name}>
                  {file.name}
                </p>
                <p className="text-xs text-metallic-500 mt-1">{formatFileSize(file.size)}</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={closePreview}
        title="Image Preview"
        size="lg"
      >
        {selectedFile && (
          <div className="space-y-4">
            <div className="bg-metallic-100 rounded-lg overflow-hidden">
              <img
                src={selectedFile.url}
                alt={selectedFile.name}
                className="w-full h-auto"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-metallic-700">Filename:</span>
                <span className="text-sm text-ink">{selectedFile.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-metallic-700">Size:</span>
                <span className="text-sm text-ink">{formatFileSize(selectedFile.size)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-metallic-700">Uploaded:</span>
                <span className="text-sm text-ink">
                  {new Date(selectedFile.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end space-x-4">
              <Button
                variant="outline"
                onClick={() => copyToClipboard(selectedFile.url)}
              >
                Copy URL
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  handleDelete(selectedFile);
                  closePreview();
                }}
                leftIcon={<TrashIcon className="w-4 h-4" />}
              >
                Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
