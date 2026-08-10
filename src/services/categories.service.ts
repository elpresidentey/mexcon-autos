import { supabase } from './supabase';
import type { Category, CategoryFormData } from '../types';
import { validateCategoryForm } from '../utils/validation';
import { uploadImage, deleteImage, STORAGE_BUCKETS } from './supabase';

/**
 * Categories Service
 * Handles all category-related operations
 */
export class CategoriesService {
  private readonly BUCKET = STORAGE_BUCKETS.CATEGORIES;

  /**
   * Get all categories
   */
  async getCategories(includeProductCount: boolean = false): Promise<Category[]> {
    try {
      let query = supabase
        .from('categories')
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
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  /**
   * Get a single category by ID
   */
  async getCategory(id: string): Promise<Category | null> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error fetching category:', error);
      throw error;
    }
  }

  /**
   * Get category by slug for public pages
   */
  async getCategoryBySlug(slug: string): Promise<Category | null> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error fetching category by slug:', error);
      throw error;
    }
  }

  /**
   * Create a new category with image
   */
  async createCategory(categoryData: CategoryFormData, imageFile?: File): Promise<Category> {
    try {
      // Validate category data
      const validation = validateCategoryForm(categoryData);
      if (!validation.valid) {
        throw new Error(validation.errors.join(', '));
      }

      // Check for duplicate name
      const { data: existingCategory } = await supabase
        .from('categories')
        .select('id')
        .eq('name', categoryData.name)
        .single();

      if (existingCategory) {
        throw new Error('A category with this name already exists');
      }

      // Check for duplicate slug
      const { data: existingSlug } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', categoryData.slug)
        .single();

      if (existingSlug) {
        throw new Error('A category with this slug already exists');
      }

      let imagePath: string | null = null;
      let imageUrl: string | null = null;

      // Upload image if provided
      if (imageFile) {
        const result = await uploadImage(this.BUCKET, imageFile, 'categories');
        if (result) {
          imagePath = result.path;
          imageUrl = result.url;
        }
      }

      // Get next order index
      const { data: lastCategory } = await supabase
        .from('categories')
        .select('order_index')
        .order('order_index', { ascending: false })
        .limit(1)
        .single();

      const nextOrderIndex = (lastCategory?.order_index || 0) + 1;

      // Create category
      const { data: category, error } = await supabase
        .from('categories')
        .insert({
          ...categoryData,
          image_path: imagePath,
          image_url: imageUrl,
          order_index: nextOrderIndex,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      return category;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  /**
   * Update an existing category
   */
  async updateCategory(id: string, categoryData: Partial<CategoryFormData>, imageFile?: File): Promise<Category> {
    try {
      // Validate category data if provided
      if (Object.keys(categoryData).length > 0) {
        const validation = validateCategoryForm(categoryData);
        if (!validation.valid) {
          throw new Error(validation.errors.join(', '));
        }
      }

      // Check for duplicate name (excluding current category)
      if (categoryData.name) {
        const { data: existingCategory } = await supabase
          .from('categories')
          .select('id')
          .eq('name', categoryData.name)
          .neq('id', id)
          .single();

        if (existingCategory) {
          throw new Error('A category with this name already exists');
        }
      }

      // Check for duplicate slug (excluding current category)
      if (categoryData.slug) {
        const { data: existingSlug } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', categoryData.slug)
          .neq('id', id)
          .single();

        if (existingSlug) {
          throw new Error('A category with this slug already exists');
        }
      }

      const updateData: Partial<Category> = { ...categoryData };

      // Handle image upload if provided
      if (imageFile) {
        // First, get current image to delete it later
        const { data: currentCategory } = await supabase
          .from('categories')
          .select('image_path')
          .eq('id', id)
          .single();

        // Upload new image
        const result = await uploadImage(this.BUCKET, imageFile, 'categories');
        if (result) {
          updateData.image_path = result.path;
          updateData.image_url = result.url;

          // Delete old image if it exists
          if (currentCategory?.image_path) {
            await deleteImage(this.BUCKET, currentCategory.image_path);
          }
        }
      }

      const { data: category, error } = await supabase
        .from('categories')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return category;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }

  /**
   * Delete a category
   * Note: Cannot delete categories that have products
   */
  async deleteCategory(id: string): Promise<void> {
    try {
      // Check if category has products
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id')
        .eq('category_id', id)
        .limit(1);

      if (productsError) throw productsError;

      if (products && products.length > 0) {
        throw new Error('Cannot delete category that has products. Move or delete the products first.');
      }

      // Get category to delete image
      const { data: category } = await supabase
        .from('categories')
        .select('image_path')
        .eq('id', id)
        .single();

      // Delete image if it exists
      if (category?.image_path) {
        await deleteImage(this.BUCKET, category.image_path);
      }

      // Delete category
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }

  /**
   * Reorder categories
   */
  async reorderCategories(categoryIds: string[]): Promise<void> {
    try {
      // Update order for all categories
      for (let i = 0; i < categoryIds.length; i++) {
        const categoryId = categoryIds[i];
        const { error } = await supabase
          .from('categories')
          .update({ order_index: i })
          .eq('id', categoryId);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error reordering categories:', error);
      throw error;
    }
  }

  /**
   * Toggle category active status
   */
  async toggleCategoryActive(id: string): Promise<Category> {
    try {
      // Get current status
      const { data: currentCategory } = await supabase
        .from('categories')
        .select('is_active')
        .eq('id', id)
        .single();

      if (!currentCategory) {
        throw new Error('Category not found');
      }

      const { data: category, error } = await supabase
        .from('categories')
        .update({ is_active: !currentCategory.is_active })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return category;
    } catch (error) {
      console.error('Error toggling category active status:', error);
      throw error;
    }
  }

  /**
   * Get categories with product counts (for public pages)
   */
  async getCategoriesWithProductCounts(): Promise<Array<Category & { product_count: number }>> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          products:products(count)
        `)
        .eq('is_active', true)
        .order('order_index');

      if (error) throw error;

      // Transform the data to include product_count
      return (data || []).map(category => ({
        ...category,
        product_count: category.products?.[0]?.count || 0,
      }));
    } catch (error) {
      console.error('Error fetching categories with product counts:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const categoriesService = new CategoriesService();