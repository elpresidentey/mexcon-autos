import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productsService } from '../../services/products.service';
import { categoriesService } from '../../services/categories.service';
import { brandsService } from '../../services/brands.service';
import type { Category, Brand, ProductFormData } from '../../types';
import {
  Button,
  Card,
  Input,
  Select,
  Textarea,
  Checkbox,
  LoadingSpinner,
  Breadcrumbs,
} from '../../components/common';
import { ImageGallery } from '../../components/common';
import type { ImageGalleryImage } from '../../components/common/ImageGallery';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export const ProductFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSaving, setIsSaving] = useState(false);
  const [newImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<ImageGalleryImage[]>([]);

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    category_id: '',
    brand_id: '',
    price: 0,
    description: '',
    oem_number: '',
    part_number: '',
    specifications: '',
    compatibility_notes: '',
    compatible_models: [],
    engine_type: '',
    is_featured: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadDropdownData();
    if (isEditMode && id) {
      loadProduct(id);
    }
  }, [id, isEditMode]);

  const loadDropdownData = async () => {
    try {
      const [categoriesData, brandsData] = await Promise.all([
        categoriesService.getCategories(),
        brandsService.getBrands(),
      ]);
      setCategories(categoriesData);
      setBrands(brandsData);
    } catch (error) {
      console.error('Error loading dropdown data:', error);
      toast.error('Failed to load categories and brands');
    }
  };

  const loadProduct = async (productId: string) => {
    try {
      setIsLoading(true);
      const data = await productsService.getProduct(productId);
      
      if (!data) {
        toast.error('Product not found');
        navigate('/admin/products');
        return;
      }

      setFormData({
        name: data.name,
        category_id: data.category_id,
        brand_id: data.brand_id,
        price: data.price,
        description: data.description || '',
        oem_number: data.oem_number || '',
        part_number: data.part_number || '',
        specifications: data.specifications || '',
        compatibility_notes: data.compatibility_notes || '',
        compatible_models: data.compatible_models || [],
        engine_type: data.engine_type || '',
        is_featured: data.is_featured || false,
      });

      // Convert product images to ImageGallery format
      if (data.images) {
        setExistingImages(
          data.images.map((img) => ({
            id: img.id,
            url: img.url,
            path: img.path,
            alt: img.alt_text,
          }))
        );
      }
    } catch (error) {
      console.error('Error loading product:', error);
      toast.error('Failed to load product');
      navigate('/admin/products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    const nextValue =
      name === 'compatible_models'
        ? value.split(',').map((item) => item.trim()).filter(Boolean)
        : type === 'checkbox'
          ? checked
          : type === 'number'
            ? Number(value)
            : value;

    setFormData((prev) => ({
      ...prev,
      [name]: nextValue,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.category_id) {
      newErrors.category_id = 'Category is required';
    }

    if (!formData.brand_id) {
      newErrors.brand_id = 'Brand is required';
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Valid price is required';
    }

    if (!isEditMode && newImages.length === 0) {
      newErrors.images = 'At least one product image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSaving(true);

    try {
      if (isEditMode && id) {
        // Update existing product
        await productsService.updateProduct(id, formData);
        
        // Upload new images if any
        if (newImages.length > 0) {
          await productsService.uploadProductImages(id, newImages);
        }

        toast.success('Product updated successfully');
      } else {
        // Create new product
        await productsService.createProduct(formData, newImages);
        toast.success('Product created successfully');
      }

      navigate('/admin/products');
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast.error(error.message || 'Failed to save product');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImagesChange = (images: ImageGalleryImage[]) => {
    setExistingImages(images);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const breadcrumbs = [
    { label: 'Products', href: '/admin/products' },
    { label: isEditMode ? 'Edit Product' : 'New Product' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Breadcrumbs items={breadcrumbs} />
        <div className="flex items-center justify-between mt-4">
          <div>
            <h1 className="text-3xl font-bold text-stone-900">
              {isEditMode ? 'Edit Product' : 'Add New Product'}
            </h1>
            <p className="text-stone-600 mt-1">
              {isEditMode ? 'Update product information' : 'Create a new product in the catalogue'}
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate('/admin/products')} leftIcon={<ArrowLeftIcon className="w-5 h-5" />}>
            Back
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-stone-900 mb-6">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Input
                label="Product Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                required
                placeholder="e.g., Brake Pad Set - Front"
              />
            </div>

            <Select
              label="Category"
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              error={errors.category_id}
              required
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>

            <Select
              label="Brand"
              name="brand_id"
              value={formData.brand_id}
              onChange={handleChange}
              error={errors.brand_id}
              required
            >
              <option value="">Select Brand</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </Select>

            <Input
              label="Price (NGN)"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
              error={errors.price}
              required
              placeholder="0.00"
              step="0.01"
              min="0"
            />

            <div className="md:col-span-2">
              <Textarea
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Provide a detailed description of the product..."
                rows={4}
              />
            </div>
          </div>
        </Card>

        {/* Part Numbers */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-stone-900 mb-6">Part Numbers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="OEM Number"
              name="oem_number"
              value={formData.oem_number}
              onChange={handleChange}
              placeholder="e.g., 04465-0K370"
            />

            <Input
              label="Part Number"
              name="part_number"
              value={formData.part_number}
              onChange={handleChange}
              placeholder="e.g., BP-1234"
            />
          </div>
        </Card>

        {/* Technical Details */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-stone-900 mb-6">Technical Details</h2>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Engine Type"
                name="engine_type"
                value={formData.engine_type || ''}
                onChange={handleChange}
                placeholder="e.g., 2.0L 3ZR-FAE"
                helperText="Specific engine configuration this part fits"
              />

              <Input
                label="Compatible Models"
                name="compatible_models"
                value={(formData.compatible_models || []).join(', ')}
                onChange={handleChange}
                placeholder="e.g., Corolla 2017, Camry 2020, RAV4"
                helperText="Comma-separated list of vehicles this part fits"
              />
            </div>

            <Textarea
              label="Specifications"
              name="specifications"
              value={formData.specifications}
              onChange={handleChange}
              placeholder="List technical specifications..."
              rows={5}
            />

            <Textarea
              label="Compatibility Notes"
              name="compatibility_notes"
              value={formData.compatibility_notes}
              onChange={handleChange}
              placeholder="Describe vehicle compatibility..."
              rows={3}
            />
          </div>
        </Card>

        {/* Product Images */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-stone-900 mb-6">Product Images</h2>
          <ImageGallery
            images={existingImages}
            onChange={handleImagesChange}
            maxImages={10}
            bucket="products"
            storagePath={isEditMode && id ? `products/${id}` : 'products/temp'}
            onUploadError={(_file, error) => toast.error(error)}
            onDeleteError={(_image, error) => toast.error(error)}
            showUploader={true}
          />
          {errors.images && <p className="text-red-600 text-sm mt-2">{errors.images}</p>}
        </Card>

        {/* Settings */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-stone-900 mb-6">Settings</h2>
          <Checkbox
            label="Featured Product"
            name="is_featured"
            checked={formData.is_featured}
            onChange={handleChange}
            helperText="Featured products appear on the homepage"
          />
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/products')} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSaving} disabled={isSaving}>
            {isSaving ? 'Saving...' : isEditMode ? 'Update Product' : 'Create Product'}
          </Button>
        </div>
      </form>
    </div>
  );
};
