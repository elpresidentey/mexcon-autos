import { supabase } from './supabase';
import type { HomepageBanner } from '../types';

/**
 * Banners Service
 * Handles homepage hero banner slides, fetched live from the homepage_banners table.
 */
export class BannersService {
  /**
   * Get all active homepage banners ordered by display order
   */
  async getActiveBanners(): Promise<HomepageBanner[]> {
    try {
      const { data, error } = await supabase
        .from('homepage_banners')
        .select('*')
        .eq('active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return (data ?? []) as HomepageBanner[];
    } catch (error) {
      console.error('Error fetching homepage banners:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const bannersService = new BannersService();