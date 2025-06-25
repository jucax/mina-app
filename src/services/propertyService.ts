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

      // Validate required fields
      if (!formData.intent) {
        throw new Error('Intent is required');
      }
      if (!formData.timeline) {
        throw new Error('Timeline is required');
      }
      if (!formData.price) {
        throw new Error('Price is required');
      }
      if (!formData.property_type) {
        throw new Error('Property type is required');
      }
      if (!formData.state) {
        throw new Error('State is required');
      }
      if (!formData.municipality) {
        throw new Error('Municipality is required');
      }
      if (!formData.street) {
        throw new Error('Street is required');
      }
      if (!formData.postal_code) {
        throw new Error('Postal code is required');
      }
      if (!formData.commission_percentage) {
        throw new Error('Commission percentage is required');
      }

      // Transform form data to database format
      const propertyData: Partial<Property> = {
        owner_id: user.id,
        intent: formData.intent,
        timeline: formData.timeline,
        price: parseFloat(formData.price),
        property_type: formData.property_type,
        other_type: formData.other_type || undefined,
        
        // Documentation
        has_identification: formData.documentation.identification,
        has_tax_constancy: formData.documentation.tax_constancy,
        has_address_proof: formData.documentation.address_proof,
        has_deed: formData.documentation.deed,
        has_property_tax: formData.documentation.property_tax,
        has_water_bill: formData.documentation.water_bill,
        has_electricity_bill: formData.documentation.electricity_bill,
        has_folio_consultation: formData.documentation.folio_consultation,
        documentation_comments: formData.documentation_comments || undefined,
        
        // Location
        country: formData.country,
        state: formData.state,
        municipality: formData.municipality,
        neighborhood: formData.neighborhood || undefined,
        street: formData.street,
        postal_code: formData.postal_code,
        
        // Characteristics
        land_area: formData.land_area ? parseFloat(formData.land_area) : undefined,
        construction_area: formData.construction_area ? parseFloat(formData.construction_area) : undefined,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : undefined,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : undefined,
        half_bathrooms: formData.half_bathrooms ? parseInt(formData.half_bathrooms) : undefined,
        amenities: formData.amenities || undefined,
        additional_info: formData.additional_info || undefined,
        
        // Images
        images: formData.images.length > 0 ? formData.images : undefined,
        
        // Commission
        commission_percentage: parseFloat(formData.commission_percentage),
        
        // Status
        status: 'draft'
      };

      console.log('📝 Form data being saved:', formData);
      console.log('💾 Property data to insert:', propertyData);

      const { data, error } = await supabase
        .from('properties')
        .insert(propertyData)
        .select()
        .single();

      if (error) {
        console.error('Error creating property:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in createProperty:', error);
      throw error;
    }
  }

  // Get all properties for the current user
  static async getUserProperties(): Promise<Property[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user properties:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserProperties:', error);
      throw error;
    }
  }

  // Get a single property by ID
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

  // Update a property
  static async updateProperty(id: string, updates: Partial<Property>): Promise<Property | null> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .update(updates)
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
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting property:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in deleteProperty:', error);
      throw error;
    }
  }

  // Publish a property (change status from draft to active)
  static async publishProperty(id: string): Promise<Property | null> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .update({ status: 'active' })
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

  // Upload images to Supabase Storage
  static async uploadImages(images: string[]): Promise<string[]> {
    try {
      const uploadedUrls: string[] = [];
      
      for (let i = 0; i < images.length; i++) {
        const imageUri = images[i];
        const fileName = `property-images/${Date.now()}-${i}.jpg`;
        
        // Convert base64 or local URI to blob
        const response = await fetch(imageUri);
        const blob = await response.blob();
        
        const { data, error } = await supabase.storage
          .from('property-images')
          .upload(fileName, blob);

        if (error) {
          console.error('Error uploading image:', error);
          throw error;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('property-images')
          .getPublicUrl(fileName);

        uploadedUrls.push(urlData.publicUrl);
      }

      return uploadedUrls;
    } catch (error) {
      console.error('Error in uploadImages:', error);
      throw error;
    }
  }
} 