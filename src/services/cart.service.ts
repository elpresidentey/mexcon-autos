import { supabase } from './supabase';
import type { CartItem, Product } from '../types';

/**
 * Cart Service
 * Handles cart operations for both guest and authenticated users
 */
export class CartService {
  private readonly STORAGE_KEY = 'mexcon_cart';

  /**
   * Get cart from localStorage (for guests)
   */
  getLocalCart(): CartItem[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading local cart:', error);
      return [];
    }
  }

  /**
   * Save cart to localStorage
   */
  saveLocalCart(cart: CartItem[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving local cart:', error);
    }
  }

  /**
   * Clear local cart
   */
  clearLocalCart(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Add item to cart
   */
  addToCart(product: Product, quantity: number = 1): CartItem[] {
    const cart = this.getLocalCart();
    const existingIndex = cart.findIndex(item => item.product_id === product.id);

    if (existingIndex >= 0) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({
        id: crypto.randomUUID(),
        customer_id: '',
        product_id: product.id,
        quantity,
        created_at: new Date().toISOString(),
        product,
      });
    }

    this.saveLocalCart(cart);
    return cart;
  }

  /**
   * Remove item from cart
   */
  removeFromCart(productId: string): CartItem[] {
    const cart = this.getLocalCart().filter(item => item.product_id !== productId);
    this.saveLocalCart(cart);
    return cart;
  }

  /**
   * Update item quantity
   */
  updateQuantity(productId: string, quantity: number): CartItem[] {
    const cart = this.getLocalCart();
    const item = cart.find(item => item.product_id === productId);

    if (item) {
      if (quantity <= 0) {
        return this.removeFromCart(productId);
      }
      item.quantity = quantity;
      this.saveLocalCart(cart);
    }

    return cart;
  }

  /**
   * Clear cart
   */
  clearCart(): void {
    this.clearLocalCart();
  }

  /**
   * Get cart total
   */
  getCartTotal(cart: CartItem[]): number {
    return cart.reduce((total, item) => {
      const price = item.product?.price || 0;
      return total + (price * item.quantity);
    }, 0);
  }

  /**
   * Get cart item count
   */
  getCartItemCount(cart: CartItem[]): number {
    return cart.reduce((count, item) => count + item.quantity, 0);
  }

  /**
   * Get cart from database (for authenticated users)
   */
  async getDatabaseCart(customerId: string): Promise<CartItem[]> {
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select('*, product:products(*)')
        .eq('customer_id', customerId);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching database cart:', error);
      return [];
    }
  }

  /**
   * Add item to database cart
   */
  async addToDatabaseCart(customerId: string, productId: string, quantity: number = 1): Promise<CartItem[]> {
    try {
      // Check if item already exists
      const { data: existing } = await supabase
        .from('cart_items')
        .select('*')
        .eq('customer_id', customerId)
        .eq('product_id', productId)
        .single();

      if (existing) {
        // Update quantity
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + quantity })
          .eq('id', existing.id)
          .select('*, product:products(*)')
          .single();

        if (error) throw error;

        return await this.getDatabaseCart(customerId);
      } else {
        // Insert new item
        const { error } = await supabase
          .from('cart_items')
          .insert({
            customer_id: customerId,
            product_id: productId,
            quantity,
          });

        if (error) throw error;

        return await this.getDatabaseCart(customerId);
      }
    } catch (error) {
      console.error('Error adding to database cart:', error);
      throw error;
    }
  }

  /**
   * Remove item from database cart
   */
  async removeFromDatabaseCart(customerId: string, productId: string): Promise<CartItem[]> {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('customer_id', customerId)
        .eq('product_id', productId);

      if (error) throw error;

      return await this.getDatabaseCart(customerId);
    } catch (error) {
      console.error('Error removing from database cart:', error);
      throw error;
    }
  }

  /**
   * Update item quantity in database
   */
  async updateDatabaseQuantity(customerId: string, productId: string, quantity: number): Promise<CartItem[]> {
    try {
      if (quantity <= 0) {
        return await this.removeFromDatabaseCart(customerId, productId);
      }

      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('customer_id', customerId)
        .eq('product_id', productId);

      if (error) throw error;

      return await this.getDatabaseCart(customerId);
    } catch (error) {
      console.error('Error updating database cart quantity:', error);
      throw error;
    }
  }

  /**
   * Clear database cart
   */
  async clearDatabaseCart(customerId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('customer_id', customerId);

      if (error) throw error;
    } catch (error) {
      console.error('Error clearing database cart:', error);
      throw error;
    }
  }

  /**
   * Merge local cart with database cart (when user logs in)
   */
  async mergeCartWithDatabase(customerId: string): Promise<CartItem[]> {
    const localCart = this.getLocalCart();
    
    if (localCart.length === 0) {
      return await this.getDatabaseCart(customerId);
    }

    // Add each local item to database
    for (const item of localCart) {
      await this.addToDatabaseCart(customerId, item.product_id, item.quantity);
    }

    // Clear local cart
    this.clearLocalCart();

    return await this.getDatabaseCart(customerId);
  }
}

// Export singleton instance
export const cartService = new CartService();
