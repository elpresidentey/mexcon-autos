import { supabase } from './supabase';
import type { Enquiry, EnquiryFormData, EnquiryStatus } from '../types';
import { validateEnquiryForm } from '../utils/validation';
import { uploadImage, STORAGE_BUCKETS } from './supabase';

/**
 * Enquiries Service
 * Handles all enquiry-related operations including submission, filtering, and status updates
 */
export class EnquiriesService {
  private readonly BUCKET = STORAGE_BUCKETS.ENQUIRIES;

  /**
   * Get all enquiries with optional filtering and pagination
   */
  async getEnquiries(
    filters?: {
      status?: EnquiryStatus;
      productId?: string;
      search?: string;
      fromDate?: string;
      toDate?: string;
    },
    pagination?: {
      page: number;
      perPage: number;
    }
  ): Promise<{ data: Enquiry[]; total: number }> {
    try {
      let query = supabase
        .from('enquiries')
        .select(`
          *,
          product:products(*),
          images:enquiry_images(*)
        `, { count: 'exact' })
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.productId) {
        query = query.eq('product_id', filters.productId);
      }

      if (filters?.search) {
        query = query.or(`customer_name.ilike.%${filters.search}%,customer_email.ilike.%${filters.search}%,vehicle_details.ilike.%${filters.search}%,message.ilike.%${filters.search}%`);
      }

      if (filters?.fromDate) {
        query = query.gte('created_at', filters.fromDate);
      }

      if (filters?.toDate) {
        query = query.lte('created_at', filters.toDate);
      }

      // Apply pagination
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
      console.error('Error fetching enquiries:', error);
      throw error;
    }
  }

  /**
   * Get a single enquiry by ID with all related data
   */
  async getEnquiry(id: string): Promise<Enquiry | null> {
    try {
      const { data, error } = await supabase
        .from('enquiries')
        .select(`
          *,
          product:products(*),
          images:enquiry_images(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error fetching enquiry:', error);
      throw error;
    }
  }

  /**
   * Submit a new enquiry (for customers)
   */
  async submitEnquiry(enquiryData: EnquiryFormData, images: File[] = []): Promise<Enquiry> {
    try {
      // Validate enquiry data
      const validation = validateEnquiryForm(enquiryData);
      if (!validation.valid) {
        throw new Error(validation.errors.join(', '));
      }

      // Validate images count
      if (images.length > 5) {
        throw new Error('Maximum 5 images allowed per enquiry');
      }

      // Create enquiry via SECURITY DEFINER RPC (anon has no SELECT on enquiries,
      // so a plain .insert().select() would fail PostgREST's return=representation)
      const { data: enquiry, error: enquiryError } = await supabase.rpc(
        'submit_enquiry',
        {
          customer_name: enquiryData.customer_name,
          customer_email: enquiryData.customer_email,
          customer_phone: enquiryData.customer_phone || null,
          vehicle_details: enquiryData.vehicle_details || null,
          message: enquiryData.message,
          product_id: enquiryData.product_id || null,
        }
      );

      if (enquiryError) throw enquiryError;

      const enquiryRow = enquiry as unknown as Enquiry;
      if (!enquiryRow?.id) throw new Error('Failed to create enquiry');

      // Upload images if provided
      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const file = images[i];
          const result = await uploadImage(this.BUCKET, file, `enquiries/${enquiryRow.id}`);

          if (result) {
            const { error: imageError } = await supabase
              .from('enquiry_images')
              .insert({
                enquiry_id: enquiryRow.id,
                path: result.path,
                url: result.url,
                order_index: i,
              });

            if (imageError) throw imageError;
          }
        }
      }

      return enquiryRow;
    } catch (error) {
      console.error('Error submitting enquiry:', error);
      throw error;
    }
  }

  /**
   * Update enquiry status (for admin)
   */
  async updateEnquiryStatus(id: string, status: EnquiryStatus, notes?: string): Promise<Enquiry> {
    try {
      const updateData: Partial<Enquiry> = {
        status,
        updated_at: new Date().toISOString(),
      };

      // Add notes if provided
      if (notes) {
        const { data: currentEnquiry } = await supabase
          .from('enquiries')
          .select('admin_notes')
          .eq('id', id)
          .single();

        const currentNotes = currentEnquiry?.admin_notes || '';
        const updatedNotes = currentNotes ? `${currentNotes}\n\n${new Date().toISOString()}: ${notes}` : `${new Date().toISOString()}: ${notes}`;
        
        updateData.admin_notes = updatedNotes;
      }

      const { data: enquiry, error } = await supabase
        .from('enquiries')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          product:products(*),
          images:enquiry_images(*)
        `)
        .single();

      if (error) throw error;

      return enquiry;
    } catch (error) {
      console.error('Error updating enquiry status:', error);
      throw error;
    }
  }

  /**
   * Mark enquiry as read/unread
   */
  async toggleEnquiryReadStatus(id: string): Promise<Enquiry> {
    try {
      // Get current read status
      const { data: currentEnquiry } = await supabase
        .from('enquiries')
        .select('is_read')
        .eq('id', id)
        .single();

      if (!currentEnquiry) {
        throw new Error('Enquiry not found');
      }

      const { data: enquiry, error } = await supabase
        .from('enquiries')
        .update({
          is_read: !currentEnquiry.is_read,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select(`
          *,
          product:products(*),
          images:enquiry_images(*)
        `)
        .single();

      if (error) throw error;

      return enquiry;
    } catch (error) {
      console.error('Error toggling enquiry read status:', error);
      throw error;
    }
  }

  /**
   * Add admin notes to enquiry
   */
  async addEnquiryNotes(id: string, notes: string): Promise<Enquiry> {
    try {
      const { data: currentEnquiry } = await supabase
        .from('enquiries')
        .select('admin_notes')
        .eq('id', id)
        .single();

      const currentNotes = currentEnquiry?.admin_notes || '';
      const updatedNotes = currentNotes ? `${currentNotes}\n\n${new Date().toISOString()}: ${notes}` : `${new Date().toISOString()}: ${notes}`;

      const { data: enquiry, error } = await supabase
        .from('enquiries')
        .update({
          admin_notes: updatedNotes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select(`
          *,
          product:products(*),
          images:enquiry_images(*)
        `)
        .single();

      if (error) throw error;

      return enquiry;
    } catch (error) {
      console.error('Error adding enquiry notes:', error);
      throw error;
    }
  }

  /**
   * Delete an enquiry
   */
  async deleteEnquiry(id: string): Promise<void> {
    try {
      // TODO: Delete enquiry images from storage if needed
      // Note: We might want to keep enquiry images for audit purposes

      // Delete enquiry images from database
      const { error: imagesError } = await supabase
        .from('enquiry_images')
        .delete()
        .eq('enquiry_id', id);

      if (imagesError) throw imagesError;

      // Delete enquiry
      const { error: enquiryError } = await supabase
        .from('enquiries')
        .delete()
        .eq('id', id);

      if (enquiryError) throw enquiryError;
    } catch (error) {
      console.error('Error deleting enquiry:', error);
      throw error;
    }
  }

  /**
   * Export enquiries to CSV
   */
  async exportEnquiriesToCSV(filters?: {
    status?: EnquiryStatus;
    fromDate?: string;
    toDate?: string;
  }): Promise<string> {
    try {
      let query = supabase
        .from('enquiries')
        .select(`
          id,
          customer_name,
          customer_email,
          customer_phone,
          vehicle_details,
          product:products(name),
          status,
          message,
          admin_notes,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.fromDate) {
        query = query.gte('created_at', filters.fromDate);
      }

      if (filters?.toDate) {
        query = query.lte('created_at', filters.toDate);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Convert to CSV
      const headers = [
        'ID',
        'Customer Name',
        'Email',
        'Phone',
        'Vehicle Details',
        'Product',
        'Status',
        'Message',
        'Admin Notes',
        'Created At',
        'Updated At',
      ];

      const rows = (data || []).map(enquiry => [
        enquiry.id,
        enquiry.customer_name,
        enquiry.customer_email,
        enquiry.customer_phone || '',
        enquiry.vehicle_details || '',
        enquiry.product?.[0]?.name || '',
        enquiry.status,
        enquiry.message,
        enquiry.admin_notes || '',
        new Date(enquiry.created_at).toLocaleString(),
        new Date(enquiry.updated_at).toLocaleString(),
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => {
          // Escape commas and quotes
          const cellStr = String(cell || '');
          if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        }).join(',')),
      ].join('\n');

      return csvContent;
    } catch (error) {
      console.error('Error exporting enquiries to CSV:', error);
      throw error;
    }
  }

  /**
   * Get enquiry statistics
   */
  async getEnquiryStatistics(): Promise<{
    total: number;
    new: number;
    contacted: number;
    resolved: number;
    unread: number;
    recent: number; // Last 7 days
  }> {
    try {
      // Get all enquiries
      const { data: allEnquiries, error: allError } = await supabase
        .from('enquiries')
        .select('status, is_read, created_at');

      if (allError) throw allError;

      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const stats = {
        total: 0,
        new: 0,
        contacted: 0,
        resolved: 0,
        unread: 0,
        recent: 0,
      };

      (allEnquiries || []).forEach(enquiry => {
        stats.total++;
        
        if (enquiry.status === 'new') stats.new++;
        if (enquiry.status === 'contacted') stats.contacted++;
        if (enquiry.status === 'resolved') stats.resolved++;
        if (!enquiry.is_read) stats.unread++;
        
        const createdDate = new Date(enquiry.created_at);
        if (createdDate >= sevenDaysAgo) stats.recent++;
      });

      return stats;
    } catch (error) {
      console.error('Error fetching enquiry statistics:', error);
      throw error;
    }
  }

  /**
   * Get recent enquiries (for dashboard)
   */
  async getRecentEnquiries(limit: number = 10): Promise<Enquiry[]> {
    try {
      const { data, error } = await supabase
        .from('enquiries')
        .select(`
          *,
          product:products(name, primary_image_url)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching recent enquiries:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const enquiriesService = new EnquiriesService();