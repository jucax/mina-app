import { supabase } from './supabase';

export class ViewTrackingService {
  // Record a view when an agent views a property
  static async recordPropertyView(propertyId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if user is an agent
      const { data: userAuth } = await supabase
        .from('user_auth')
        .select('user_type, agent_id')
        .eq('id', user.id)
        .single();

      if (userAuth?.user_type !== 'agent') return;

      // Update the property's view count directly
      await supabase.rpc('increment_property_views', { property_id: propertyId });

    } catch (error) {
      console.error('Error in recordPropertyView:', error);
    }
  }

  // Get view count for a property
  static async getPropertyViewCount(propertyId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('views_count')
        .eq('id', propertyId)
        .single();

      if (error) {
        console.error('Error getting property view count:', error);
        return 0;
      }

      return data?.views_count || 0;
    } catch (error) {
      console.error('Error in getPropertyViewCount:', error);
      return 0;
    }
  }

  // Get offer count for a property
  static async getPropertyOfferCount(propertyId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('offers_count')
        .eq('id', propertyId)
        .single();

      if (error) {
        console.error('Error getting property offer count:', error);
        return 0;
      }

      return data?.offers_count || 0;
    } catch (error) {
      console.error('Error in getPropertyOfferCount:', error);
      return 0;
    }
  }

  // Increment offer count when a proposal is sent
  static async incrementPropertyOffers(propertyId: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('increment_property_offers', { property_id: propertyId });
      
      if (error) {
        console.error('Error incrementing property offers:', error);
      }
    } catch (error) {
      console.error('Error in incrementPropertyOffers:', error);
    }
  }
} 