import { supabase } from './supabase';
import type { PlatformSettings } from '../types';
import { uploadImage, deleteImage, STORAGE_BUCKETS } from './supabase';

/**
 * Settings Service
 * Handles platform settings and configuration
 */
export class SettingsService {
  private readonly SETTINGS_ID = '00000000-0000-0000-0000-000000000001'; // Fixed UUID for settings

  /**
   * Get platform settings
   */
  async getSettings(): Promise<PlatformSettings | null> {
    try {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*')
        .single();

      if (error) {
        // If no settings exist, return default settings
        if (error.code === 'PGRST116') {
          return this.getDefaultSettings();
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching settings:', error);
      throw error;
    }
  }

  /**
   * Update platform settings
   */
  async updateSettings(settings: Partial<PlatformSettings>): Promise<PlatformSettings> {
    try {
      // Validate email if provided
      if (settings.contact_email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(settings.contact_email)) {
          throw new Error('Invalid email address');
        }
      }

      // Validate phone if provided
      if (settings.contact_phone) {
        const phoneRegex = /^[0-9+\s()-]+$/;
        if (!phoneRegex.test(settings.contact_phone)) {
          throw new Error('Invalid phone number');
        }
      }

      // Check if settings exist
      const existing = await this.getSettings();

      if (existing && existing.id) {
        // Update existing settings
        const { data, error } = await supabase
          .from('platform_settings')
          .update({
            ...settings,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new settings
        const { data, error } = await supabase
          .from('platform_settings')
          .insert({
            ...this.getDefaultSettings(),
            ...settings,
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  }

  /**
   * Upload homepage banner
   */
  async uploadBanner(file: File): Promise<string> {
    try {
      // Validate file
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image size must be less than 5MB');
      }

      const result = await uploadImage(STORAGE_BUCKETS.BANNERS, file, 'homepage');
      if (!result) {
        throw new Error('Failed to upload banner');
      }

      return result.url;
    } catch (error) {
      console.error('Error uploading banner:', error);
      throw error;
    }
  }

  /**
   * Delete homepage banner
   */
  async deleteBanner(path: string): Promise<void> {
    try {
      await deleteImage(STORAGE_BUCKETS.BANNERS, path);
    } catch (error) {
      console.error('Error deleting banner:', error);
      throw error;
    }
  }

  /**
   * Get default settings
   */
  private getDefaultSettings(): PlatformSettings {
    return {
      id: this.SETTINGS_ID,
      company_name: 'Mexcon Autos',
      contact_phone: '',
      contact_email: '',
      business_address: '',
      whatsapp_number: '',
      social_media_links: {
        facebook: '',
        instagram: '',
        twitter: '',
        linkedin: '',
      },
      business_hours: 'Mon-Fri: 9:00 AM - 6:00 PM, Sat: 9:00 AM - 2:00 PM',
      seo_title: 'Mexcon Autos - Japanese & Korean Auto Spare Parts',
      seo_description: 'Quality auto spare parts for Japanese and Korean vehicles in Nigeria',
      seo_keywords: 'auto parts, spare parts, Japanese cars, Korean cars, Toyota, Honda, Hyundai',
      updated_at: new Date().toISOString(),
    };
  }

  /**
   * Test WhatsApp number
   */
  async testWhatsAppNumber(number: string): Promise<boolean> {
    try {
      // Basic validation
      const cleanNumber = number.replace(/[^0-9+]/g, '');
      if (cleanNumber.length < 10) {
        throw new Error('WhatsApp number is too short');
      }

      // In a real implementation, you might want to verify the number
      // For now, just validate the format
      return true;
    } catch (error) {
      console.error('Error testing WhatsApp number:', error);
      return false;
    }
  }
}

// Export singleton instance
export const settingsService = new SettingsService();
