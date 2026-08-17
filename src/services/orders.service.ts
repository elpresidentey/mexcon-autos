import { supabase } from './supabase';
import type { Order, CartItem } from '../types';

/**
 * Orders Service
 * Handles all order-related operations
 */
export class OrdersService {
  /**
   * Generate unique order number
   */
  private generateOrderNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `MXC-${timestamp}-${random}`;
  }

  /**
   * Create a new order from cart
   */
  async createOrder(
    customerId: string,
    cartItems: CartItem[],
    shippingAddress: any,
    paymentMethod: string,
    customerNotes?: string,
    receipt?: { path: string; url: string } | null
  ): Promise<Order> {
    try {
      const orderNumber = this.generateOrderNumber();
      
      // Calculate totals
      const subtotal = cartItems.reduce((sum, item) => {
        return sum + ((item.product?.price || 0) * item.quantity);
      }, 0);
      
      const shippingCost = 2000; // Fixed shipping cost for MVP
      const taxAmount = 0; // No tax for MVP
      const discountAmount = 0;
      const totalAmount = subtotal + shippingCost + taxAmount - discountAmount;

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          customer_id: customerId,
          status: 'pending',
          payment_status: 'pending',
          payment_method: paymentMethod,
          subtotal,
          shipping_cost: shippingCost,
          tax_amount: taxAmount,
          discount_amount: discountAmount,
          total_amount: totalAmount,
          shipping_address_line1: shippingAddress.address_line1,
          shipping_address_line2: shippingAddress.address_line2,
          shipping_city: shippingAddress.city,
          shipping_state: shippingAddress.state,
          shipping_postal_code: shippingAddress.postal_code,
          shipping_country: shippingAddress.country,
          shipping_phone: shippingAddress.phone,
          billing_address_line1: shippingAddress.address_line1,
          billing_address_line2: shippingAddress.address_line2,
          billing_city: shippingAddress.city,
          billing_state: shippingAddress.state,
          billing_postal_code: shippingAddress.postal_code,
          billing_country: shippingAddress.country,
          customer_notes: customerNotes,
          receipt_path: receipt?.path ?? null,
          receipt_url: receipt?.url ?? null,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product?.name || 'Unknown Product',
        product_sku: item.product?.part_number,
        quantity: item.quantity,
        unit_price: item.product?.price || 0,
        total_price: (item.product?.price || 0) * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  /**
   * Get order by ID
   */
  async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, customer:customers(*), items:order_items(*)')
        .eq('id', orderId)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error fetching order:', error);
      return null;
    }
  }

  /**
   * Get order by order number
   */
  async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, customer:customers(*), items:order_items(*)')
        .eq('order_number', orderNumber)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error fetching order:', error);
      return null;
    }
  }

  /**
   * Get customer orders
   */
  async getCustomerOrders(customerId: string): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, items:order_items(*)')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      return [];
    }
  }

  /**
   * Place an order as a guest (no account) via the SECURITY DEFINER RPC.
   * Accepts the same item snapshot data used for registered orders.
   */
  async createGuestOrder(payload: {
    items: Array<{
      product_id: string;
      product_name: string;
      product_sku?: string;
      quantity: number;
      unit_price: number;
      total_price: number;
    }>;
    paymentMethod: string;
    subtotal: number;
    shippingCost: number;
    taxAmount?: number;
    discountAmount?: number;
    totalAmount: number;
    shippingAddress: {
      address_line1?: string;
      address_line2?: string;
      city?: string;
      state?: string;
      postal_code?: string;
      country?: string;
      phone?: string;
    };
    customerName?: string;
    customerEmail?: string;
    customerNotes?: string;
    receipt?: { path: string; url: string } | null;
  }): Promise<{ id: string; order_number: string }> {
    try {
      const taxAmount = payload.taxAmount ?? 0;
      const discountAmount = payload.discountAmount ?? 0;

      const { data, error } = await supabase.rpc('place_guest_order', {
        p_items: payload.items,
        p_payment_method: payload.paymentMethod,
        p_subtotal: payload.subtotal,
        p_shipping_cost: payload.shippingCost,
        p_tax_amount: taxAmount,
        p_discount_amount: discountAmount,
        p_total_amount: payload.totalAmount,
        p_shipping_address_line1: payload.shippingAddress.address_line1,
        p_shipping_address_line2: payload.shippingAddress.address_line2,
        p_shipping_city: payload.shippingAddress.city,
        p_shipping_state: payload.shippingAddress.state,
        p_shipping_postal_code: payload.shippingAddress.postal_code,
        p_shipping_country: payload.shippingAddress.country,
        p_shipping_phone: payload.shippingAddress.phone,
        p_customer_name: payload.customerName,
        p_customer_email: payload.customerEmail,
        p_customer_notes: payload.customerNotes,
        p_receipt_path: payload.receipt?.path ?? null,
        p_receipt_url: payload.receipt?.url ?? null,
      });

      if (error) throw error;
      if (!data?.order_number) throw new Error('Order could not be placed');

      return data;
    } catch (error) {
      console.error('Error placing guest order:', error);
      throw error;
    }
  }

  /**
   * Public order tracking (guests + customers): requires the order number
   * plus the email used at checkout / on the customer account.
   */
  async trackOrder(orderNumber: string, email: string): Promise<Order | null> {
    try {
      const { data, error } = await supabase.rpc('track_order', {
        p_order_number: orderNumber,
        p_email: email,
      });

      if (error) throw error;

      return data as Order | null;
    } catch (error) {
      console.error('Error tracking order:', error);
      return null;
    }
  }

  /**
   * Public order tracking by product / part / OEM / SKU number (guests +
   * customers): matches order items (snapshot sku or linked product number)
   * against the number, plus the email used at checkout / on the account.
   * Returns ALL matching orders (an order can contain several items).
   */
  async trackOrdersByProduct(productNumber: string, email: string): Promise<Order[]> {
    try {
      const { data, error } = await supabase.rpc('track_order_by_product', {
        p_product_number: productNumber,
        p_email: email,
      });

      if (error) throw error;

      const results = Array.isArray(data) ? (data as Order[]) : [];
      return results;
    } catch (error) {
      console.error('Error tracking order by product:', error);
      return [];
    }
  }

  /**
   * Get all orders (for admin)
   */
  async getAllOrders(): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, customer:customers(*), items:order_items(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  }

  /**
   * Get all orders (for admin) with filters + pagination
   */
  async getOrders(
    filters?: {
      status?: string;
      paymentStatus?: string;
      search?: string;
    },
    pagination?: {
      page: number;
      perPage: number;
    }
  ): Promise<{ data: Order[]; total: number }> {
    try {
      let query = supabase
        .from('orders')
        .select('*, customer:customers(*), items:order_items(*)', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.paymentStatus) {
        query = query.eq('payment_status', filters.paymentStatus);
      }

      if (filters?.search) {
        query = query.or(
          `order_number.ilike.%${filters.search}%,customer.email.ilike.%${filters.search}%,customer.first_name.ilike.%${filters.search}%,customer.last_name.ilike.%${filters.search}%`
        );
      }

      if (pagination) {
        const start = (pagination.page - 1) * pagination.perPage;
        query = query.range(start, start + pagination.perPage - 1);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: data || [],
        total: count || 0,
      };
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  /**
   * Update order status (admin approval workflow: pending -> confirmed -> ...).
   * Pay-on-delivery orders are settled automatically when marked delivered
   * (cash is collected at the door), so payment_status flips to 'paid'.
   */
  async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    try {
      const { data: current, error: fetchError } = await supabase
        .from('orders')
        .select('payment_method, payment_status')
        .eq('id', orderId)
        .single();

      if (fetchError) throw fetchError;

      const settledOnDelivery =
        status === 'delivered' &&
        current.payment_method === 'pay_on_delivery' &&
        current.payment_status === 'pending';

      const { data, error } = await supabase
        .from('orders')
        .update({
          status,
          ...(status === 'shipped' ? { shipped_at: new Date().toISOString() } : {}),
          ...(status === 'delivered' ? { delivered_at: new Date().toISOString() } : {}),
          ...(settledOnDelivery
            ? {
                payment_status: 'paid',
                payment_verified_at: new Date().toISOString(),
                payment_verified_by: 'delivery',
              }
            : {}),
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  /**
   * Update payment status. When the status moves to 'paid' the order is
   * stamped with the verification time + who verified it (admin or gateway).
   * An optional note is kept for rejections (e.g. unclear receipt).
   */
  async updatePaymentStatus(
    orderId: string,
    paymentStatus: string,
    paymentReference?: string,
    gatewayResponse?: any,
    options?: { paymentNote?: string; verifiedBy?: string }
  ): Promise<Order> {
    const isPaid = paymentStatus === 'paid';
    const { data, error } = await supabase
      .from('orders')
      .update({
        payment_status: paymentStatus,
        payment_reference: paymentReference ?? undefined,
        payment_gateway_response: gatewayResponse ?? undefined,
        payment_note: options?.paymentNote ?? undefined,
        payment_verified_at: isPaid ? new Date().toISOString() : undefined,
        payment_verified_by: isPaid ? (options?.verifiedBy ?? 'system') : undefined,
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  /**
   * Add tracking information
   */
  async addTrackingInfo(orderId: string, trackingNumber: string, trackingUrl?: string): Promise<Order> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({
          tracking_number: trackingNumber,
          tracking_url: trackingUrl,
          status: 'shipped',
          shipped_at: new Date().toISOString(),
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error adding tracking info:', error);
      throw error;
    }
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId: string): Promise<Order> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const ordersService = new OrdersService();
