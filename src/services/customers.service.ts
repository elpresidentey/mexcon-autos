import { supabase } from './supabase';
import type { Customer, CustomerFormData, CustomerAddress, CustomerAddressFormData } from '../types';

/**
 * Customers Service
 * Handles all customer-related operations
 */
export class CustomersService {
  /**
   * Register a new customer.
   * Uses the register_customer security-definer RPC which creates the auth
   * user (email-confirmed) and the customers row in one transaction.
   *
   * NOTE: the returned id is all we can fetch here — querying the customers
   * table right after would run as anon (no session yet) and RLS would hide
   * the row. AuthContext signs the user in immediately after, which loads
   * the full profile via getCustomerByAuthId().
   */
  async registerCustomer(data: CustomerFormData): Promise<{ id: string }> {
    try {
      const { data: customerId, error: rpcError } = await supabase.rpc('register_customer', {
        p_email: data.email,
        p_password: data.password,
        p_first_name: data.first_name || null,
        p_last_name: data.last_name || null,
        p_phone: data.phone || null,
      });

      if (rpcError) throw rpcError;
      if (!customerId) throw new Error('Failed to create account');

      return { id: customerId };
    } catch (error) {
      console.error('Error registering customer:', error);
      throw error;
    }
  }

  /**
   * Get customer by auth ID.
   * Throws on network/query errors so callers can distinguish "no such
   * customer" (null) from "lookup failed" (throw).
   */
  async getCustomerByAuthId(authId: string): Promise<Customer | null> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('auth_id', authId)
        .maybeSingle();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error fetching customer:', error);
      throw error;
    }
  }

  /**
   * Get customer by ID
   */
  async getCustomerById(id: string): Promise<Customer | null> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error fetching customer:', error);
      return null;
    }
  }

  /**
   * Update customer profile
   */
  async updateCustomer(id: string, data: Partial<CustomerFormData>): Promise<Customer> {
    try {
      const { data: customer, error } = await supabase
        .from('customers')
        .update({
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return customer;
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  }

  /**
   * Get customer addresses
   */
  async getCustomerAddresses(customerId: string): Promise<CustomerAddress[]> {
    try {
      const { data, error } = await supabase
        .from('customer_addresses')
        .select('*')
        .eq('customer_id', customerId)
        .order('is_default', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching customer addresses:', error);
      throw error;
    }
  }

  /**
   * Create customer address
   */
  async createCustomerAddress(customerId: string, data: CustomerAddressFormData): Promise<CustomerAddress> {
    try {
      // If this is the default address, unset other defaults
      if (data.is_default) {
        await supabase
          .from('customer_addresses')
          .update({ is_default: false })
          .eq('customer_id', customerId);
      }

      const { data: address, error } = await supabase
        .from('customer_addresses')
        .insert({
          customer_id: customerId,
          ...data,
        })
        .select()
        .single();

      if (error) throw error;

      return address;
    } catch (error) {
      console.error('Error creating customer address:', error);
      throw error;
    }
  }

  /**
   * Update customer address
   */
  async updateCustomerAddress(addressId: string, data: Partial<CustomerAddressFormData>): Promise<CustomerAddress> {
    try {
      const { data: address, error } = await supabase
        .from('customer_addresses')
        .update(data)
        .eq('id', addressId)
        .select()
        .single();

      if (error) throw error;

      return address;
    } catch (error) {
      console.error('Error updating customer address:', error);
      throw error;
    }
  }

  /**
   * Delete customer address
   */
  async deleteCustomerAddress(addressId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('customer_addresses')
        .delete()
        .eq('id', addressId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting customer address:', error);
      throw error;
    }
  }

  /**
   * Set default address
   */
  async setDefaultAddress(customerId: string, addressId: string): Promise<void> {
    try {
      // Unset all defaults
      await supabase
        .from('customer_addresses')
        .update({ is_default: false })
        .eq('customer_id', customerId);

      // Set new default
      const { error } = await supabase
        .from('customer_addresses')
        .update({ is_default: true })
        .eq('id', addressId);

      if (error) throw error;
    } catch (error) {
      console.error('Error setting default address:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const customersService = new CustomersService();
