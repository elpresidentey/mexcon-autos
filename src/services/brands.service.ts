import { supabase } from './supabase';
import type { Brand, BrandFormData } from '../types';
import { validateBrandForm } from '../utils/validation';
import { uploadImage, deleteImage, STORAGE_BUCKETS } from './supabase';

/**
 * Brands Service
 * Handles all brand-related operations
 */
export class BrandsService {
  private readonly BUCKET = STORAGE_BUCKETS.BRANDS;

  /**
   * Get all brands
   */
  async getBrands(includeProductCount: boolean = false): Promise<Brand[]> {
    try {
      let query = supabase
        .from('brands')
        .select('*')
        .order('order_index')
        .order('created_at', { ascending: false });

      if (includeProductCount) {
        query = query.select('*, products:products(count)');
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching brands:', error);
      throw error;
    }
  }

  /**
   * Get a single brand by ID
   */
  async getBrand(id: string): Promise<Brand | null> {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error fetching brand:', error);
      throw error;
    }
  }

  /**
   * Get brand by slug for public pages
   */
  async getBrandBySlug(slug: string): Promise<Brand | null> {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error fetching brand by slug:', error);
      throw error;
    }
  }

  /**
   * Create a new brand with logo
   */
  async createBrand(brandData: BrandFormData, logoFile?: File): Promise<Brand> {
    try {
      // Validate brand data
      const validation = validateBrandForm(brandData);
      if (!validation.valid) {
        throw new Error(validation.errors.join(', '));
      }

      // Check for duplicate name
      const { data: existingBrand } = await supabase
        .from('brands')
        .select('id')
        .eq('name', brandData.name)
        .single();

      if (existingBrand) {
        throw new Error('A brand with this name already exists');
      }

      // Check for duplicate slug
      const { data: existingSlug } = await supabase
        .from('brands')
        .select('id')
        .eq('slug', brandData.slug)
        .single();

      if (existingSlug) {
        throw new Error('A brand with this slug already exists');
      }

      let logoPath: string | null = null;
      let logoUrl: string | null = null;

      // Upload logo if provided
      if (logoFile) {
        const result = await uploadImage(this.BUCKET, logoFile, 'brands');
        if (result) {
          logoPath = result.path;
          logoUrl = result.url;
        }
      }

      // Get next order index
      const { data: lastBrand } = await supabase
        .from('brands')
        .select('order_index')
        .order('order_index', { ascending: false })
        .limit(1)
        .single();

      const nextOrderIndex = (lastBrand?.order_index || 0) + 1;

      // Create brand
      const { data: brand, error } = await supabase
        .from('brands')
        .insert({
          ...brandData,
          logo_path: logoPath,
          logo_url: logoUrl,
          order_index: nextOrderIndex,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      return brand;
    } catch (error) {
      console.error('Error creating brand:', error);
      throw error;
    }
  }

  /**
   * Update an existing brand
   */
  async updateBrand(id: string, brandData: Partial<BrandFormData>, logoFile?: File): Promise<Brand> {
    try {
      // Validate brand data if provided
      if (Object.keys(brandData).length > 0) {
        const validation = validateBrandForm(brandData);
        if (!validation.valid) {
          throw new Error(validation.errors.join(', '));
        }
      }

      // Check for duplicate name (excluding current brand)
      if (brandData.name) {
        const { data: existingBrand } = await supabase
          .from('brands')
          .select('id')
          .eq('name', brandData.name)
          .neq('id', id)
          .single();

        if (existingBrand) {
          throw new Error('A brand with this name already exists');
        }
      }

      // Check for duplicate slug (excluding current brand)
      if (brandData.slug) {
        const { data: existingSlug } = await supabase
          .from('brands')
          .select('id')
          .eq('slug', brandData.slug)
          .neq('id', id)
          .single();

        if (existingSlug) {
          throw new Error('A brand with this slug already exists');
        }
      }

      const updateData: Partial<Brand> = { ...brandData };

      // Handle logo upload if provided
      if (logoFile) {
        // First, get current logo to delete it later
        const { data: currentBrand } = await supabase
          .from('brands')
          .select('logo_path')
          .eq('id', id)
          .single();

        // Upload new logo
        const result = await uploadImage(this.BUCKET, logoFile, 'brands');
        if (result) {
          updateData.logo_path = result.path;
          updateData.logo_url = result.url;

          // Delete old logo if it exists
          if (currentBrand?.logo_path) {
            await deleteImage(this.BUCKET, currentBrand.logo_path);
          }
        }
      }

      const { data: brand, error } = await supabase
        .from('brands')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return brand;
    } catch (error) {
      console.error('Error updating brand:', error);
      throw error;
    }
  }

  /**
   * Delete a brand
   * Note: Cannot delete brands that have products
   */
  async deleteBrand(id: string): Promise<void> {
    try {
      // Check if brand has products
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id')
        .eq('brand_id', id)
        .limit(1);

      if (productsError) throw productsError;

      if (products && products.length > 0) {
        throw new Error('Cannot delete brand that has products. Move or delete the products first.');
      }

      // Get brand to delete logo
      const { data: brand } = await supabase
        .from('brands')
        .select('logo_path')
        .eq('id', id)
        .single();

      // Delete logo if it exists
      if (brand?.logo_path) {
        await deleteImage(this.BUCKET, brand.logo_path);
      }

      // Delete brand
      const { error } = await supabase
        .from('brands')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting brand:', error);
      throw error;
    }
  }

  /**
   * Reorder brands
   */
  async reorderBrands(brandIds: string[]): Promise<void> {
    try {
      // Update order for all brands
      for (let i = 0; i < brandIds.length; i++) {
        const brandId = brandIds[i];
        const { error } = await supabase
          .from('brands')
          .update({ order_index: i })
          .eq('id', brandId);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error reordering brands:', error);
      throw error;
    }
  }

  /**
   * Toggle brand active status
   */
  async toggleBrandActive(id: string): Promise<Brand> {
    try {
      // Get current status
      const { data: currentBrand } = await supabase
        .from('brands')
        .select('is_active')
        .eq('id', id)
        .single();

      if (!currentBrand) {
        throw new Error('Brand not found');
      }

      const { data: brand, error } = await supabase
        .from('brands')
        .update({ is_active: !currentBrand.is_active })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return brand;
    } catch (error) {
      console.error('Error toggling brand active status:', error);
      throw error;
    }
  }

  /**
   * Get brands with product counts (for public pages)
   */
  async getBrandsWithProductCounts(): Promise<Array<Brand & { product_count: number }>> {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select(`
          *,
          products:products(count)
        `)
        .eq('is_active', true)
        .order('order_index');

      if (error) throw error;

      // Transform the data to include product_count
      return (data || []).map(brand => ({
        ...brand,
        product_count: brand.products?.[0]?.count || 0,
      }));
    } catch (error) {
      console.error('Error fetching brands with product counts:', error);
      throw error;
    }
  }

  /**
   * Get featured brands (for homepage)
   */
  async getFeaturedBrands(limit: number = 8): Promise<Brand[]> {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('is_featured', true)
        .eq('is_active', true)
        .order('order_index')
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching featured brands:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const brandsService = new BrandsService();