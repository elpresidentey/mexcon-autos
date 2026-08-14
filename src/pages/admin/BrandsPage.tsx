import { useState, useEffect } from 'react';
import { brandsService } from '../../services/brands.service';
import type { Brand, BrandFormData } from '../../types';
import {
  Button,
  Card,
  Input,
  Textarea,
  Modal,
  LoadingSpinner,
  Badge,
  EmptyState,
} from '../../components/common';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon, PhotoIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

export const BrandsPage = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState<BrandFormData>({
    name: '',
    slug: '',
    description: '',
    country: '',
    website: '',
    is_featured: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    try {
      setIsLoading(true);
      const data = await brandsService.getBrandsWithProductCounts();
      setBrands(data);
    } catch (error) {
      console.error('Error loading brands:', error);
      toast.error('Failed to load brands');
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (brand?: Brand) => {
    if (brand) {
      setEditingBrand(brand);
      setFormData({
        name: brand.name,
        slug: brand.slug,
        description: brand.description || '',
        country: brand.country || '',
        website: brand.website || '',
        is_featured: brand.is_featured,
      });
      setLogoPreview(brand.logo_url || null);
    } else {
      setEditingBrand(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        country: '',
        website: '',
        is_featured: false,
      });
      setLogoPreview(null);
    }
    setLogoFile(null);
    setErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBrand(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      country: '',
      website: '',
      is_featured: false,
    });
    setLogoFile(null);
    setLogoPreview(null);
    setErrors({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Auto-generate slug from name
    if (name === 'name' && !editingBrand) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setFormData((prev) => ({ ...prev, slug }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Logo size must be less than 5MB');
        return;
      }

      setLogoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Brand name is required';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug must contain only lowercase letters, numbers, and hyphens';
    }

    if (formData.website && !formData.website.match(/^https?:\/\/.+/)) {
      newErrors.website = 'Website must be a valid URL (starting with http:// or https://)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSaving(true);

    try {
      if (editingBrand) {
        await brandsService.updateBrand(editingBrand.id, formData, logoFile || undefined);
        toast.success('Brand updated successfully');
      } else {
        await brandsService.createBrand(formData, logoFile || undefined);
        toast.success('Brand created successfully');
      }

      closeModal();
      loadBrands();
    } catch (error: any) {
      console.error('Error saving brand:', error);
      toast.error(error.message || 'Failed to save brand');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await brandsService.deleteBrand(id);
      toast.success('Brand deleted successfully');
      loadBrands();
    } catch (error: any) {
      console.error('Error deleting brand:', error);
      toast.error(error.message || 'Failed to delete brand');
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await brandsService.toggleBrandActive(id);
      toast.success('Brand status updated');
      loadBrands();
    } catch (error: any) {
      console.error('Error toggling brand status:', error);
      toast.error(error.message || 'Failed to update brand status');
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl lg:text-4xl font-extrabold uppercase tracking-wide text-ink">Brands</h1>
          <p className="text-metallic-600 mt-1">Manage vehicle brands and manufacturers</p>
        </div>
        <Button onClick={() => openModal()} leftIcon={<PlusIcon className="w-5 h-5" />}>
          Add Brand
        </Button>
      </div>

      {/* Brands Grid */}
      {brands.length === 0 ? (
        <Card>
          <EmptyState
            title="No brands found"
            description="Get started by adding your first brand"
            action={
              <Button onClick={() => openModal()} leftIcon={<PlusIcon className="w-5 h-5" />}>
                Add Brand
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {brands.map((brand) => (
            <Card key={brand.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start space-x-4">
                {/* Brand Logo */}
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-metallic-100 flex-shrink-0">
                  {brand.logo_url ? (
                    <img src={brand.logo_url} alt={brand.name} className="w-full h-full object-contain p-2" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-metallic-400">
                      <PhotoIcon className="w-8 h-8" />
                    </div>
                  )}
                </div>

                {/* Brand Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-ink truncate">{brand.name}</h3>
                        {brand.is_featured && (
                          <StarIconSolid className="w-4 h-4 text-accent-500 flex-shrink-0" title="Featured" />
                        )}
                      </div>
                      <p className="text-sm text-metallic-500 mt-1">/{brand.slug}</p>
                      {brand.country && (
                        <p className="text-xs text-metallic-400 mt-1">{brand.country}</p>
                      )}
                    </div>
                    <Badge variant={brand.is_active ? 'success' : 'secondary'} className="ml-2">
                      {brand.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  {brand.description && (
                    <p className="text-sm text-metallic-600 mt-2 line-clamp-2">{brand.description}</p>
                  )}

                  <div className="flex items-center justify-between mt-4">
                    <span className="text-sm text-metallic-500">
                      {brand.product_count || 0} products
                    </span>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleToggleActive(brand.id)}
                        className="p-2 text-metallic-600 hover:text-ink hover:bg-metallic-100 rounded-lg transition-colors"
                        title={brand.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {brand.is_active ? (
                          <EyeSlashIcon className="w-4 h-4" />
                        ) : (
                          <EyeIcon className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => openModal(brand)}
                        className="p-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(brand.id, brand.name)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-metallic-100 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingBrand ? 'Edit Brand' : 'Add New Brand'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Brand Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            required
            placeholder="e.g., Toyota"
          />

          <Input
            label="Slug"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            error={errors.slug}
            required
            placeholder="e.g., toyota"
            helperText="URL-friendly version of the name"
          />

          <Input
            label="Country"
            name="country"
            value={formData.country || ''}
            onChange={handleChange}
            placeholder="e.g., Japan"
            helperText="Country of origin"
          />

          <Input
            label="Website"
            name="website"
            value={formData.website || ''}
            onChange={handleChange}
            error={errors.website}
            placeholder="https://www.example.com"
            helperText="Official brand website (optional)"
          />

          <Textarea
            label="Description"
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            placeholder="Brief description of this brand..."
            rows={3}
          />

          {/* Featured Checkbox */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_featured"
              name="is_featured"
              checked={formData.is_featured}
              onChange={handleChange}
              className="w-4 h-4 text-primary-600 border-metallic-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="is_featured" className="flex items-center text-sm font-medium text-metallic-700 cursor-pointer">
              <StarIcon className="w-4 h-4 mr-1" />
              Featured Brand
            </label>
          </div>

          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-metallic-700 mb-2">Brand Logo</label>
            <div className="flex items-start space-x-4">
              {logoPreview && (
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-metallic-100 flex items-center justify-center p-2">
                  <img src={logoPreview} alt="Preview" className="max-w-full max-h-full object-contain" />
                </div>
              )}
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="block w-full text-sm text-metallic-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-medium
                    file:bg-primary-50 file:text-primary-700
                    hover:file:bg-primary-100
                    cursor-pointer"
                />
                <p className="text-xs text-metallic-500 mt-1">PNG, JPG, WebP up to 5MB</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={closeModal} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSaving} disabled={isSaving}>
              {isSaving ? 'Saving...' : editingBrand ? 'Update Brand' : 'Create Brand'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
