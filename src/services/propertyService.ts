import { supabase } from './supabase';
import { Property, PropertyFormData } from '../types/property';

export class PropertyService {
  // Create a new property
  static async createProperty(formData: PropertyFormData): Promise<Property | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('🔍 Original form data:', formData);

      // Create a clean object with only the fields that exist in the database
      const dbPropertyData = {
        // Basic fields
        owner_id: user.id,
        status: 'draft' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        
        // Intent and timeline
        intent: formData.intent === 'both' ? 'venta' : (formData.intent === 'sell' ? 'venta' : 'renta'),
        timeline: formData.timeline || null,
        
        // Price
        price: parseFloat(formData.price) || 0,
        
        // Property type and other_type
        property_type: formData.property_type,
        other_type: formData.property_type === 'Otro' ? formData.other_type : null,
        
        // Location
        country: formData.country,
        state: formData.state,
        municipality: formData.municipality,
        neighborhood: formData.neighborhood,
        street: formData.street,
        postal_code: formData.postal_code,
        
        // Property characteristics
        land_area: parseFloat(formData.land_area) || 0,
        construction_area: parseFloat(formData.construction_area) || 0,
        bedrooms: parseInt(formData.bedrooms) || 0,
        bathrooms: parseInt(formData.bathrooms) || 0,
        half_bathrooms: parseInt(formData.half_bathrooms) || 0,
        
        // Images
        images: formData.images || [],
        
        // Commission
        commission_percentage: parseFloat(formData.commission_percentage || '0') || 0,
        
        // Documentation as JSON string
        documentation: JSON.stringify(formData.documentation || {}),
        
        // Description from amenities and additional_info
        description: [formData.amenities, formData.additional_info].filter(Boolean).join('\n\n'),
      };

      console.log('🔍 Cleaned property data for database:', dbPropertyData);

      const { data, error } = await supabase
        .from('properties')
        .insert(dbPropertyData)
        .select()
        .single();

      if (error) {
        console.error('Error creating property:', error);
        throw error;
      }

      console.log('✅ Property created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error in createProperty:', error);
      throw error;
    }
  }

  // Get all properties
  static async getAllProperties(): Promise<Property[]> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching properties:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllProperties:', error);
      throw error;
    }
  }

  // Get properties by owner
  static async getPropertiesByOwner(ownerId: string): Promise<Property[]> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching owner properties:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getPropertiesByOwner:', error);
      throw error;
    }
  }

  // Get property by ID
  static async getPropertyById(id: string): Promise<Property | null> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching property:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in getPropertyById:', error);
      throw error;
    }
  }

  // Update property
  static async updateProperty(id: string, updates: Partial<Property>): Promise<Property | null> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating property:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in updateProperty:', error);
      throw error;
    }
  }

  // Delete a property
  static async deleteProperty(id: string): Promise<void> {
    try {
      console.log('🗑️ PropertyService: Starting deletion process for property ID:', id);
      
      // First, let's check if the property exists and get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      console.log('✅ PropertyService: User authenticated:', user.id);
      
      // Check if property exists and belongs to user
      const { data: property, error: fetchError } = await supabase
        .from('properties')
        .select('id, owner_id')
        .eq('id', id)
        .single();
        
      if (fetchError) {
        console.error('❌ PropertyService: Error fetching property for deletion:', fetchError);
        throw new Error(`Property not found: ${fetchError.message}`);
      }
      
      if (property.owner_id !== user.id) {
        console.error('❌ PropertyService: User does not own this property');
        throw new Error('You do not have permission to delete this property');
      }
      
      console.log('✅ PropertyService: Property ownership verified');
      
      // Now delete the property
      const { error: deleteError } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('❌ PropertyService: Error deleting property:', deleteError);
        throw new Error(`Failed to delete property: ${deleteError.message}`);
      }
      
      console.log('✅ PropertyService: Property deleted successfully');
    } catch (error) {
      console.error('❌ PropertyService: Error in deleteProperty:', error);
      throw error;
    }
  }

  // Publish a property (change status from draft to active)
  static async publishProperty(id: string): Promise<Property | null> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .update({ 
          status: 'published',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error publishing property:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in publishProperty:', error);
      throw error;
    }
  }

  // Get properties by filters
  static async getPropertiesByFilters(filters: {
    property_type?: string;
    intent?: string;
    min_price?: number;
    max_price?: number;
    bedrooms?: number;
    bathrooms?: number;
    state?: string;
    municipality?: string;
  }): Promise<Property[]> {
    try {
      let query = supabase
        .from('properties')
        .select('*')
        .eq('status', 'published');

      if (filters.property_type) {
        query = query.eq('property_type', filters.property_type);
      }

      if (filters.intent) {
        query = query.eq('intent', filters.intent);
      }

      if (filters.min_price) {
        query = query.gte('price', filters.min_price);
      }

      if (filters.max_price) {
        query = query.lte('price', filters.max_price);
      }

      if (filters.bedrooms) {
        query = query.gte('bedrooms', filters.bedrooms);
      }

      if (filters.bathrooms) {
        query = query.gte('bathrooms', filters.bathrooms);
      }

      if (filters.state) {
        query = query.eq('state', filters.state);
      }

      if (filters.municipality) {
        query = query.eq('municipality', filters.municipality);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching filtered properties:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getPropertiesByFilters:', error);
      throw error;
    }
  }

  // Search properties by text
  static async searchProperties(searchTerm: string): Promise<Property[]> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'published')
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,municipality.ilike.%${searchTerm}%,state.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error searching properties:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in searchProperties:', error);
      throw error;
    }
  }

  // Increment view count
  static async incrementViewCount(id: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('increment_property_views', {
        property_id: id
      });

      if (error) {
        console.error('Error incrementing view count:', error);
        // Don't throw error for view count, just log it
      }
    } catch (error) {
      console.error('Error in incrementViewCount:', error);
      // Don't throw error for view count
    }
  }

  // Get property statistics
  static async getPropertyStats(propertyId: string): Promise<{
    views_count: number;
    offers_count: number;
  } | null> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('views_count, offers_count')
        .eq('id', propertyId)
        .single();

      if (error) {
        console.error('Error fetching property stats:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getPropertyStats:', error);
      return null;
    }
  }
}
