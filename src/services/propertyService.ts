import * as FileSystem from 'expo-file-system';
import { supabase, supabaseAnonKey } from './supabase';
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

      // Upload images to Supabase Storage if they exist
      let uploadedImageUrls: string[] = [];
      if (formData.images && formData.images.length > 0) {
        console.log('📤 Property creation: Starting image upload process...');
        console.log('📊 Image details:', {
          count: formData.images.length,
          firstImage: formData.images[0],
          allImages: formData.images
        });
        
        try {
          uploadedImageUrls = await PropertyService.uploadImages(formData.images);
          console.log('✅ Property creation: Images uploaded successfully:', {
            uploadedCount: uploadedImageUrls.length,
            urls: uploadedImageUrls
          });
        } catch (uploadError) {
          console.error('❌ Property creation: Error uploading images:', {
            error: uploadError,
            message: uploadError instanceof Error ? uploadError.message : 'Unknown error'
          });
          throw new Error('Failed to upload images. Please try again.');
        }
      } else {
        console.log('ℹ️ Property creation: No images to upload');
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
        
        // Images - Use uploaded URLs instead of local URIs
        images: uploadedImageUrls.length > 0 ? uploadedImageUrls : undefined,
        
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
      // If images are being updated, upload them first
      if (updates.images && updates.images.length > 0) {
        console.log('📤 Property update: Starting image upload process...');
        console.log('📊 Update image details:', {
          count: updates.images.length,
          firstImage: updates.images[0],
          allImages: updates.images
        });
        
        // Check if these are local URIs (need to upload) or already URLs (already uploaded)
        const needsUpload = updates.images.some(img => img.startsWith('file://') || img.startsWith('content://'));
        
        console.log('🔍 Image upload analysis:', {
          needsUpload,
          localUriCount: updates.images.filter(img => img.startsWith('file://') || img.startsWith('content://')).length,
          urlCount: updates.images.filter(img => img.startsWith('http')).length
        });
        
        if (needsUpload) {
          try {
            const uploadedUrls = await PropertyService.uploadImages(updates.images);
            updates.images = uploadedUrls;
            console.log('✅ Property update: Images uploaded successfully:', {
              uploadedCount: uploadedUrls.length,
              urls: uploadedUrls
            });
          } catch (uploadError) {
            console.error('❌ Property update: Error uploading images:', {
              error: uploadError,
              message: uploadError instanceof Error ? uploadError.message : 'Unknown error'
            });
            throw new Error('Failed to upload images. Please try again.');
          }
        } else {
          console.log('ℹ️ Property update: Images are already URLs, skipping upload');
        }
      } else {
        console.log('ℹ️ Property update: No images to process');
      }

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
    console.log('🚀 PropertyService.uploadImages() called with', images.length, 'images');
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < images.length; i++) {
        const imageUri = images[i];
        if (!imageUri.startsWith('file://') && !imageUri.startsWith('content://')) {
          console.error(`❌ Skipping non-local image URI:`, imageUri);
          continue;
        }
        console.log(`📤 Processing image ${i + 1}/${images.length}:`, imageUri);
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 15);
        const fileExt = imageUri.split('.').pop() || 'jpg';
        const fileName = `property-images/${timestamp}-${randomId}-${i}.${fileExt}`;
        const supabaseUrl = 'https://tliwzfdnpeozlanhpxmn.supabase.co';
        const bucket = 'property-images';
        const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucket}/${timestamp}-${randomId}-${i}.${fileExt}`;
        let contentType = 'image/jpeg';
        if (fileExt === 'png') contentType = 'image/png';
        if (fileExt === 'webp') contentType = 'image/webp';
        console.log('🚀 Uploading to Supabase Storage REST endpoint...');
        const uploadRes = await FileSystem.uploadAsync(uploadUrl, imageUri, {
          httpMethod: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Content-Type': contentType,
          },
          uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
        });
        console.log('📤 uploadAsync response:', uploadRes);
        if (uploadRes.status !== 200 && uploadRes.status !== 201) {
          throw new Error(`Upload failed: ${uploadRes.status} ${uploadRes.body}`);
        }
        // Construct the public URL
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${timestamp}-${randomId}-${i}.${fileExt}`;
        uploadedUrls.push(publicUrl);
        console.log(`✅ Property image ${i + 1} uploaded and public URL:`, publicUrl);
        // Add a small delay between uploads to avoid rate limiting
        if (i < images.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      console.log(`🎉 All ${uploadedUrls.length} images uploaded successfully`);
      console.log(`📋 Final URLs:`, uploadedUrls);
      return uploadedUrls;
    } catch (error) {
      console.error('❌ Error in uploadImages:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        imagesCount: images.length
      });
      throw error;
    }
  }

  // Clean up properties with local URIs (these won't work across devices)
  static async cleanupLocalUriProperties(): Promise<{ cleaned: number; errors: string[] }> {
    try {
      console.log('🧹 Starting cleanup of properties with local URIs...');
      
      // Get all properties with local URIs
      const { data: propertiesWithLocalUris, error: fetchError } = await supabase
        .from('properties')
        .select('id, images')
        .not('images', 'is', null);

      if (fetchError) {
        throw fetchError;
      }

      let cleaned = 0;
      const errors: string[] = [];

      for (const property of propertiesWithLocalUris || []) {
        if (!property.images) continue;

        let hasLocalUri = false;

        // Handle both text[] and jsonb array types
        if (Array.isArray(property.images)) {
          // text[] array type
          hasLocalUri = property.images.some((img: string) => 
            img.startsWith('file://') || img.startsWith('content://') || img.includes('/data/')
          );
        } else if (typeof property.images === 'object' && property.images !== null) {
          // jsonb array type - convert to array and check
          const imageArray = Array.isArray(property.images) ? property.images : [property.images];
          hasLocalUri = imageArray.some((img: any) => {
            const imgStr = typeof img === 'string' ? img : JSON.stringify(img);
            return imgStr.startsWith('file://') || imgStr.startsWith('content://') || imgStr.includes('/data/');
          });
        }

        if (hasLocalUri) {
          console.log(`🧹 Cleaning up property ${property.id} with local URIs`);
          
          try {
            // Remove the images (set to null) since they're local URIs
            const { error: updateError } = await supabase
              .from('properties')
              .update({ images: null })
              .eq('id', property.id);

            if (updateError) {
              errors.push(`Failed to clean property ${property.id}: ${updateError.message}`);
            } else {
              cleaned++;
              console.log(`✅ Cleaned property ${property.id}`);
            }
          } catch (cleanupError) {
            errors.push(`Error cleaning property ${property.id}: ${cleanupError}`);
          }
        }
      }

      console.log(`🎉 Cleanup completed: ${cleaned} properties cleaned, ${errors.length} errors`);
      return { cleaned, errors };
    } catch (error) {
      console.error('❌ Error in cleanupLocalUriProperties:', error);
      throw error;
    }
  }

  // Get all properties (for agents to view)
  static async getAllProperties(): Promise<Property[]> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching all properties:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllProperties:', error);
      throw error;
    }
  }
} 