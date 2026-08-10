import { supabase } from './supabase';
import type { Product, ProductFormData, ProductImage } from '../types';
import { validateProductForm } from '../utils/validation';
import { uploadImage, deleteImage, STORAGE_BUCKETS } from './supabase';

export interface ProductFilters {
  categoryId?: string;
  category_id?: string;
  brandId?: string;
  brand_id?: string;
  search?: string;
  isActive?: boolean;
  is_active?: boolean;
  isFeatured?: boolean;
  featured?: boolean;
  manufacturer?: string;
  model?: string;
  engineType?: string;
  engine_type?: string;
  year?: number | string;
  sortBy?: string;
  sort_by?: string;
  sortOrder?: 'asc' | 'desc';
  sort_order?: 'asc' | 'desc';
}

/**
 * Products Service
 * Handles all product-related operations including CRUD, filtering, and image management
 */
export class ProductsService {
  private readonly BUCKET = STORAGE_BUCKETS.PRODUCTS;

  /**
   * Get all products with optional filtering and pagination
   */
  async getProducts(
    filters?: ProductFilters,
    pagination?: {
      page: number;
      perPage: number;
    }
  ): Promise<{ data: Product[]; total: number }> {
    try {
      const categoryId = filters?.categoryId || filters?.category_id;
      const brandId = filters?.brandId || filters?.brand_id;
      const isActive = filters?.isActive !== undefined ? filters.isActive : filters?.is_active;
      const isFeatured = filters?.isFeatured !== undefined ? filters.isFeatured : filters?.featured;
      const engineType = filters?.engineType || filters?.engine_type;
      const sortBy = filters?.sortBy || filters?.sort_by || 'created_at';
      const sortOrder = filters?.sortOrder || filters?.sort_order || 'desc';

      let query = supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          brand:brands(*),
          images:product_images(*)
        `, { count: 'exact' });

      // Apply filters
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      if (brandId) {
        query = query.eq('brand_id', brandId);
      }

      // Escape LIKE wildcards so user input is matched literally
      const escapeLike = (value: string) => value.replace(/[\\%_]/g, (ch) => `\\${ch}`);

      // OEM/part numbers are stored with separators (e.g. '48510-07010') but
      // customers type them without ('4851007010'). Normalize the query the
      // same way the generated *_clean columns are computed on the row side.
      const normalizeCode = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

      // Free-text search across text columns. Each `or()` group becomes its own
      // PostgREST `or` param, so groups combine with AND.
      const textGroups: string[] = [];

      if (filters?.search) {
        const raw = filters.search.trim();
        const s = escapeLike(raw);
        if (s) {
          const codeTerms: string[] = [];
          const code = normalizeCode(raw);
          // A query that is purely a code (no spaces) also matches the
          // normalized OEm/part-number columns, so '4851007010' finds
          // '48510-07010'. Terms with spaces are matched as-is against the
          // original columns.
          if (code && !raw.includes(' ')) {
            codeTerms.push(`oem_number_clean.ilike.%${escapeLike(code)}%`);
            codeTerms.push(`part_number_clean.ilike.%${escapeLike(code)}%`);
          }
          textGroups.push([
            `name.ilike.%${s}%`,
            `description.ilike.%${s}%`,
            `oem_number.ilike.%${s}%`,
            `part_number.ilike.%${s}%`,
            `compatibility_notes.ilike.%${s}%`,
            `specifications.ilike.%${s}%`,
            `compatible_models::text.ilike.%${s}%`,
            ...codeTerms,
          ].join(','));
        }
      }

      // Vehicle model / year compatibility. The products table stores
      // compatible_models as a TEXT[] (e.g. {"Corolla 2017","2.0L 3ZR-FAE"}),
      // so we match against its text representation for substring matches.
      if (filters?.model) {
        textGroups.push([
          `name.ilike.%${escapeLike(filters.model)}%`,
          `description.ilike.%${escapeLike(filters.model)}%`,
          `compatible_models::text.ilike.%${escapeLike(filters.model)}%`,
        ].join(','));
      }

      if (filters?.year) {
        const yearStr = escapeLike(String(filters.year));
        textGroups.push([
          `name.ilike.%${yearStr}%`,
          `compatible_models::text.ilike.%${yearStr}%`,
        ].join(','));
      }

      for (const group of textGroups) {
        query = query.or(group);
      }

      if (isActive !== undefined) {
        query = query.eq('is_active', isActive);
      }

      if (isFeatured !== undefined) {
        query = query.eq('is_featured', isFeatured);
      }

      if (engineType) {
        query = query.eq('engine_type', engineType);
      }

      if (filters?.manufacturer) {
        const brandIds = await this.resolveManufacturerToBrandIds(filters.manufacturer);
        if (brandIds.length === 0) {
          return { data: [], total: 0 };
        }
        query = query.in('brand_id', brandIds);
      }

      // Apply pagination
      if (pagination) {
        const start = (pagination.page - 1) * pagination.perPage;
        query = query.range(start, start + pagination.perPage - 1);
      }

      // Order by requested sort
      const allowedSorts = ['created_at', 'name', 'view_count', 'price'];
      const orderBy = allowedSorts.includes(sortBy) ? sortBy : 'created_at';
      query = query.order(orderBy, { ascending: sortOrder === 'asc' });

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: data || [],
        total: count || 0,
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  /**
   * Resolve a manufacturer/brand name to brand IDs
   */
  private async resolveManufacturerToBrandIds(manufacturer: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('id')
        .ilike('name', `%${manufacturer}%`);

      if (error) throw error;

      return (data || []).map((b) => b.id);
    } catch (error) {
      console.error('Error resolving manufacturer to brands:', error);
      return [];
    }
  }

  /**
   * Relevance-ranked product search (customer shop). Delegates to the
   * `search_products` RPC which weights name/OEM/part-number/compatibility
   * matches and returns joined category/brand/images JSON.
   */
  async searchProducts(
    filters?: ProductFilters,
    pagination?: {
      page: number;
      perPage: number;
    }
  ): Promise<{ data: Product[]; total: number }> {
    try {
      const categoryId = filters?.categoryId || filters?.category_id;
      const brandId = filters?.brandId || filters?.brand_id;
      const isActive = filters?.isActive !== undefined ? filters.isActive : filters?.is_active;
      const engineType = filters?.engineType || filters?.engine_type;
      const sortBy = filters?.sortBy || filters?.sort_by || 'relevance';
      const sortOrder = filters?.sortOrder || filters?.sort_order || 'desc';
      const allowedSorts = ['relevance', 'created_at', 'name', 'view_count', 'price'];

      const { data, error } = await supabase.rpc('search_products', {
        p_search: filters?.search || null,
        p_category_id: categoryId || null,
        p_brand_id: brandId || null,
        p_year: filters?.year ? Number(filters.year) || null : null,
        p_manufacturer: filters?.manufacturer || null,
        p_engine_type: engineType || null,
        p_is_active: isActive ?? true,
        p_sort: allowedSorts.includes(sortBy) ? sortBy : 'relevance',
        p_sort_order: sortOrder,
        p_page: pagination?.page || 1,
        p_per_page: pagination?.perPage || 12,
      });

      if (error) throw error;

      const row = (data as Array<{ products: unknown; total: number }> | null)?.[0];
      return {
        data: (row?.products as Product[]) || [],
        total: Number(row?.total || 0),
      };
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }

  /**
   * Get a single product by ID with all related data
   */
  async getProduct(id: string): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          brand:brands(*),
          images:product_images(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  /**
   * Increment a product's view count (called when a customer views the detail page)
   */
  async incrementViewCount(id: string): Promise<void> {
    try {
      await supabase.rpc('increment_product_view', { product_id: id });
    } catch {
      // Fallback: update directly if the RPC doesn't exist yet
      const { data: current } = await supabase
        .from('products')
        .select('view_count')
        .eq('id', id)
        .single();

      if (current) {
        await supabase
          .from('products')
          .update({ view_count: (current.view_count || 0) + 1 })
          .eq('id', id);
      }
    }
  }

  /**
   * Create a new product with images
   */
  async createProduct(productData: ProductFormData, images: File[]): Promise<Product> {
    try {
      // Validate product data
      const validation = validateProductForm(productData);
      if (!validation.valid) {
        throw new Error(validation.errors.join(', '));
      }

      // Validate images
      if (images.length === 0) {
        throw new Error('At least one product image is required');
      }

      if (images.length > 10) {
        throw new Error('Maximum 10 images allowed per product');
      }

      // Start transaction
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
          ...productData,
          is_active: true,
        })
        .select()
        .single();

      if (productError) throw productError;

      // Upload images
      const uploadedImages: ProductImage[] = [];
      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        const result = await uploadImage(this.BUCKET, file, `products/${product.id}`);

        if (result) {
          const { data: imageRecord, error: imageError } = await supabase
            .from('product_images')
            .insert({
              product_id: product.id,
              path: result.path,
              url: result.url,
              alt_text: `Product image ${i + 1}`,
              is_primary: i === 0,
              order_index: i,
            })
            .select()
            .single();

          if (imageError) throw imageError;
          uploadedImages.push(imageRecord);
        }
      }

      // Update product with image IDs
      if (uploadedImages.length > 0) {
        const { error: updateError } = await supabase
          .from('products')
          .update({ primary_image_id: uploadedImages[0].id })
          .eq('id', product.id);

        if (updateError) throw updateError;
      }

      return {
        ...product,
        images: uploadedImages,
      } as Product;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  /**
   * Update an existing product
   */
  async updateProduct(id: string, productData: Partial<ProductFormData>): Promise<Product> {
    try {
      // Validate product data if provided
      if (Object.keys(productData).length > 0) {
        const validation = validateProductForm(productData);
        if (!validation.valid) {
          throw new Error(validation.errors.join(', '));
        }
      }

      const { data: product, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id)
        .select(`
          *,
          category:categories(*),
          brand:brands(*),
          images:product_images(*)
        `)
        .single();

      if (error) throw error;

      return product;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  /**
   * Delete a product and all its images
   */
  async deleteProduct(id: string): Promise<void> {
    try {
      // Get product images first
      const { data: images } = await supabase
        .from('product_images')
        .select('path')
        .eq('product_id', id);

      // Delete images from storage
      if (images && images.length > 0) {
        for (const image of images) {
          await deleteImage(this.BUCKET, image.path);
        }
      }

      // Delete product images from database
      const { error: imagesError } = await supabase
        .from('product_images')
        .delete()
        .eq('product_id', id);

      if (imagesError) throw imagesError;

      // Delete product
      const { error: productError } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (productError) throw productError;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  /**
   * Upload additional images to a product
   */
  async uploadProductImages(productId: string, files: File[]): Promise<ProductImage[]> {
    try {
      // Get current images count
      const { data: currentImages, error: countError } = await supabase
        .from('product_images')
        .select('id')
        .eq('product_id', productId);

      if (countError) throw countError;

      const currentCount = currentImages?.length || 0;
      const remainingSlots = 10 - currentCount;

      if (files.length > remainingSlots) {
        throw new Error(`Maximum 10 images allowed. You can upload ${remainingSlots} more image(s).`);
      }

      const uploadedImages: ProductImage[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const result = await uploadImage(this.BUCKET, file, `products/${productId}`);

        if (result) {
          const { data: imageRecord, error: imageError } = await supabase
            .from('product_images')
            .insert({
              product_id: productId,
              path: result.path,
              url: result.url,
              alt_text: `Product image ${currentCount + i + 1}`,
              is_primary: currentCount === 0 && i === 0,
              order_index: currentCount + i,
            })
            .select()
            .single();

          if (imageError) throw imageError;
          uploadedImages.push(imageRecord);
        }
      }

      // Update primary image if this is the first image
      if (currentCount === 0 && uploadedImages.length > 0) {
        const { error: updateError } = await supabase
          .from('products')
          .update({ primary_image_id: uploadedImages[0].id })
          .eq('id', productId);

        if (updateError) throw updateError;
      }

      return uploadedImages;
    } catch (error) {
      console.error('Error uploading product images:', error);
      throw error;
    }
  }

  /**
   * Delete a product image
   */
  async deleteProductImage(productId: string, imageId: string, imagePath: string): Promise<void> {
    try {
      // Delete from storage
      await deleteImage(this.BUCKET, imagePath);

      // Delete from database
      const { error: deleteError } = await supabase
        .from('product_images')
        .delete()
        .eq('id', imageId)
        .eq('product_id', productId);

      if (deleteError) throw deleteError;

      // Check if this was the primary image
      const { data: product } = await supabase
        .from('products')
        .select('primary_image_id')
        .eq('id', productId)
        .single();

      if (product?.primary_image_id === imageId) {
        // Set new primary image (first available)
        const { data: remainingImages } = await supabase
          .from('product_images')
          .select('id')
          .eq('product_id', productId)
          .order('order_index')
          .limit(1);

        const newPrimaryId = remainingImages?.[0]?.id || null;

        const { error: updateError } = await supabase
          .from('products')
          .update({ primary_image_id: newPrimaryId })
          .eq('id', productId);

        if (updateError) throw updateError;
      }
    } catch (error) {
      console.error('Error deleting product image:', error);
      throw error;
    }
  }

  /**
   * Reorder product images
   */
  async reorderProductImages(productId: string, imageIds: string[]): Promise<void> {
    try {
      // Update order for all images
      for (let i = 0; i < imageIds.length; i++) {
        const imageId = imageIds[i];
        const { error } = await supabase
          .from('product_images')
          .update({ order_index: i, is_primary: i === 0 })
          .eq('id', imageId)
          .eq('product_id', productId);

        if (error) throw error;
      }

      // Update product's primary image
      if (imageIds.length > 0) {
        const { error: updateError } = await supabase
          .from('products')
          .update({ primary_image_id: imageIds[0] })
          .eq('id', productId);

        if (updateError) throw updateError;
      }
    } catch (error) {
      console.error('Error reordering product images:', error);
      throw error;
    }
  }

  /**
   * Toggle product active status
   */
  async toggleProductActive(id: string): Promise<Product> {
    try {
      // Get current status
      const { data: currentProduct } = await supabase
        .from('products')
        .select('is_active')
        .eq('id', id)
        .single();

      if (!currentProduct) {
        throw new Error('Product not found');
      }

      const { data: product, error } = await supabase
        .from('products')
        .update({ is_active: !currentProduct.is_active })
        .eq('id', id)
        .select(`
          *,
          category:categories(*),
          brand:brands(*),
          images:product_images(*)
        `)
        .single();

      if (error) throw error;

      return product;
    } catch (error) {
      console.error('Error toggling product active status:', error);
      throw error;
    }
  }

  /**
   * Get featured products (for homepage)
   */
  async getFeaturedProducts(limit: number = 6): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          brand:brands(*),
          images:product_images(*)
        `)
        .eq('is_featured', true)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching featured products:', error);
      throw error;
    }
  }

  /**
   * Get latest products
   */
  async getLatestProducts(limit: number = 8): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          brand:brands(*),
          images:product_images(*)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching latest products:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const productsService = new ProductsService();