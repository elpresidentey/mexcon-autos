import { useState, useEffect } from 'react';
import { categoriesService } from '../../services/categories.service';
import type { Category, CategoryFormData } from '../../types';
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
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon, PhotoIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    slug: '',
    description: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const data = await categoriesService.getCategories(true);
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
      });
      setImagePreview(category.image_url || null);
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
      });
      setImagePreview(null);
    }
    setImageFile(null);
    setErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({ name: '', slug: '', description: '' });
    setImageFile(null);
    setImagePreview(null);
    setErrors({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Auto-generate slug from name
    if (name === 'name' && !editingCategory) {
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }

      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug must contain only lowercase letters, numbers, and hyphens';
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
      if (editingCategory) {
        await categoriesService.updateCategory(editingCategory.id, formData, imageFile || undefined);
        toast.success('Category updated successfully');
      } else {
        await categoriesService.createCategory(formData, imageFile || undefined);
        toast.success('Category created successfully');
      }

      closeModal();
      loadCategories();
    } catch (error: any) {
      console.error('Error saving category:', error);
      toast.error(error.message || 'Failed to save category');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await categoriesService.deleteCategory(id);
      toast.success('Category deleted successfully');
      loadCategories();
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast.error(error.message || 'Failed to delete category');
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await categoriesService.toggleCategoryActive(id);
      toast.success('Category status updated');
      loadCategories();
    } catch (error: any) {
      console.error('Error toggling category status:', error);
      toast.error(error.message || 'Failed to update category status');
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
          <h1 className="font-display text-3xl lg:text-4xl font-extrabold uppercase tracking-wide text-ink">Categories</h1>
          <p className="text-metallic-600 mt-1">Organize your products into categories</p>
        </div>
        <Button onClick={() => openModal()} leftIcon={<PlusIcon className="w-5 h-5" />}>
          Add Category
        </Button>
      </div>

      {/* Categories Grid */}
      {categories.length === 0 ? (
        <Card>
          <EmptyState
            title="No categories found"
            description="Get started by adding your first category"
            action={
              <Button onClick={() => openModal()} leftIcon={<PlusIcon className="w-5 h-5" />}>
                Add Category
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card key={category.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start space-x-4">
                {/* Category Image */}
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-metallic-100 flex-shrink-0">
                  {category.image_url ? (
                    <img src={category.image_url} alt={category.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-metallic-400">
                      <PhotoIcon className="w-8 h-8" />
                    </div>
                  )}
                </div>

                {/* Category Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-ink truncate">{category.name}</h3>
                      <p className="text-sm text-metallic-500 mt-1">/{category.slug}</p>
                    </div>
                    <Badge variant={category.is_active ? 'success' : 'secondary'} className="ml-2">
                      {category.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  {category.description && (
                    <p className="text-sm text-metallic-600 mt-2 line-clamp-2">{category.description}</p>
                  )}

                  <div className="flex items-center justify-between mt-4">
                    <span className="text-sm text-metallic-500">
                      {(category as any).products?.[0]?.count || 0} products
                    </span>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleToggleActive(category.id)}
                        className="p-2 text-metallic-600 hover:text-ink hover:bg-metallic-100 rounded-lg transition-colors"
                        title={category.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {category.is_active ? (
                          <EyeSlashIcon className="w-4 h-4" />
                        ) : (
                          <EyeIcon className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => openModal(category)}
                        className="p-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id, category.name)}
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
        title={editingCategory ? 'Edit Category' : 'Add New Category'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Category Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            required
            placeholder="e.g., Engine Components"
          />

          <Input
            label="Slug"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            error={errors.slug}
            required
            placeholder="e.g., engine-components"
            helperText="URL-friendly version of the name"
          />

          <Textarea
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Brief description of this category..."
            rows={3}
          />

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-metallic-700 mb-2">Category Image</label>
            <div className="flex items-start space-x-4">
              {imagePreview && (
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-metallic-100">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
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
              {isSaving ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
