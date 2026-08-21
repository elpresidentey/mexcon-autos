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
    stock_status: 'in_stock',
    condition_label: 'genuine',
    warranty_months: 6,
    is_featured: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Numeric fields are kept as raw text while typing so commas/spaces/decimals
  // behave naturally (native type="number" rejects them mid-edit), and are
  // parsed back to numbers on submit.
  const [priceDraft, setPriceDraft] = useState('');
  const [warrantyDraft, setWarrantyDraft] = useState('6');

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      categoriesService.getCategories(),
      brandsService.getBrands(),
    ])
      .then(([categoriesData, brandsData]) => {
        if (cancelled) return;
        setCategories(categoriesData);
        setBrands(brandsData);
      })
      .catch((error) => {
        console.error('Error loading dropdown data:', error);
        toast.error('Failed to load categories and brands');
      });

    if (isEditMode && id) {
      productsService
        .getProduct(id)
        .then((data) => {
          if (cancelled) return;
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
            stock_status: data.stock_status || 'in_stock',
            condition_label: data.condition_label || 'genuine',
            warranty_months: data.warranty_months ?? 6,
            is_featured: data.is_featured || false,
          });
          setPriceDraft(String(data.price ?? ''));
          setWarrantyDraft(String(data.warranty_months ?? 6));

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
        })
        .catch((error) => {
          console.error('Error loading product:', error);
          toast.error('Failed to load product');
          navigate('/admin/products');
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false);
        });
    }

    return () => {
      cancelled = true;
    };
  }, [id, isEditMode, navigate]);

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

    const parsedPrice = parseFloat(priceDraft.replace(/,/g, '').trim());
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      newErrors.price = 'Valid price is required';
    }

    const parsedWarranty = parseInt(warrantyDraft.replace(/,/g, '').trim(), 10);
    if (isNaN(parsedWarranty) || parsedWarranty < 0) {
      newErrors.warranty_months = 'Warranty must be 0 or more months';
    }

    if (!isEditMode && existingImages.length === 0) {
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

    const payload = {
      ...formData,
      price: parseFloat(priceDraft.replace(/,/g, '').trim()),
      warranty_months: parseInt(warrantyDraft.replace(/,/g, '').trim(), 10) || 0,
    };

    setIsSaving(true);

    try {
      if (isEditMode && id) {
        // Update existing product
        await productsService.updateProduct(id, payload, existingImages);

        toast.success('Product updated successfully');
      } else {
        // Create new product
        await productsService.createProduct(payload, existingImages);
        toast.success('Product created successfully');
      }

      navigate('/admin/products');
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save product');
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
            <h1 className="font-display text-3xl lg:text-4xl font-extrabold uppercase tracking-wide text-ink">
              {isEditMode ? 'Edit Product' : 'Add New Product'}
            </h1>
            <p className="text-metallic-600 mt-1">
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
          <h2 className="font-display text-xl font-bold uppercase tracking-wide text-ink mb-6">Basic Information</h2>
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
              type="text"
              inputMode="decimal"
              value={priceDraft}
              onChange={(e) => {
                setPriceDraft(e.target.value.replace(/[^0-9.,]/g, ''));
                if (errors.price) setErrors((prev) => ({ ...prev, price: '' }));
              }}
              error={errors.price}
              required
              placeholder="e.g. 13,500"
              helperText="Numbers only — commas are allowed"
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
          <h2 className="font-display text-xl font-bold uppercase tracking-wide text-ink mb-6">Part Numbers</h2>
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
          <h2 className="font-display text-xl font-bold uppercase tracking-wide text-ink mb-6">Technical Details</h2>
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

        {/* Availability */}
        <Card className="p-6">
          <h2 className="font-display text-xl font-bold uppercase tracking-wide text-ink mb-6">Availability</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Select
              label="Stock Status"
              name="stock_status"
              value={formData.stock_status || 'in_stock'}
              onChange={handleChange}
            >
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
              <option value="pre_order">Pre-Order</option>
            </Select>

            <Select
              label="Condition / Origin"
              name="condition_label"
              value={formData.condition_label || 'genuine'}
              onChange={handleChange}
            >
              <option value="genuine">Genuine (OEM boxed)</option>
              <option value="oem_equivalent">OEM Equivalent</option>
              <option value="aftermarket">Aftermarket</option>
              <option value="rebuilt">Rebuilt / Refurbished</option>
              <option value="used">Used (Salvage)</option>
            </Select>

            <Input
              label="Warranty (months)"
              name="warranty_months"
              type="text"
              inputMode="numeric"
              value={warrantyDraft}
              onChange={(e) => {
                setWarrantyDraft(e.target.value.replace(/[^0-9]/g, ''));
                if (errors.warranty_months) setErrors((prev) => ({ ...prev, warranty_months: '' }));
              }}
              error={errors.warranty_months}
              helperText="e.g., 6 = six months warranty"
            />
          </div>
        </Card>

        {/* Product Images */}
        <Card className="p-6">
          <h2 className="font-display text-xl font-bold uppercase tracking-wide text-ink mb-6">Product Images</h2>
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
          <h2 className="font-display text-xl font-bold uppercase tracking-wide text-ink mb-6">Settings</h2>
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
