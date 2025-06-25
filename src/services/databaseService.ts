import { supabase } from './supabase';
import {
  Owner,
  Agent,
  Property,
  Favorite,
  Contact,
  UserAuth,
  PropertyWithOwner,
  PropertyWithFavorites,
  OwnerRegistrationData,
  AgentRegistrationData,
  PropertyCreationData,
  DatabaseResponse
} from '../types/database';

// =====================================================
// USER AUTHENTICATION SERVICES
// =====================================================

export const userAuthService = {
  // Get current user's auth record
  async getCurrentUserAuth(): Promise<DatabaseResponse<UserAuth>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: null, error: 'No authenticated user' };
      }

      const { data, error } = await supabase
        .from('user_auth')
        .select('*')
        .eq('id', user.id)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Create user auth record
  async createUserAuth(userId: string, userType: 'owner' | 'agent', profileId: string): Promise<DatabaseResponse<UserAuth>> {
    try {
      const userAuthData = {
        id: userId,
        user_type: userType,
        [userType === 'owner' ? 'owner_id' : 'agent_id']: profileId
      };

      const { data, error } = await supabase
        .from('user_auth')
        .insert(userAuthData)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get user type
  async getUserType(userId: string): Promise<DatabaseResponse<'owner' | 'agent' | null>> {
    try {
      const { data, error } = await supabase
        .from('user_auth')
        .select('user_type')
        .eq('id', userId)
        .single();

      return { data: data?.user_type || null, error };
    } catch (error) {
      return { data: null, error };
    }
  }
};

// =====================================================
// OWNER SERVICES
// =====================================================

export const ownerService = {
  // Create new owner
  async createOwner(ownerData: OwnerRegistrationData, userId: string): Promise<DatabaseResponse<Owner>> {
    try {
      const insertData = {
        id: userId,
        ...ownerData
      };
      console.log('Insertando en owners:', insertData);

      const { data, error } = await supabase
        .from('owners')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('❌ Error al crear perfil de propietario:', error);
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('❌ Error inesperado al crear perfil de propietario:', error);
      return { data: null, error };
    }
  },

  // Get owner by ID
  async getOwnerById(ownerId: string): Promise<DatabaseResponse<Owner>> {
    try {
      const { data, error } = await supabase
        .from('owners')
        .select('*')
        .eq('id', ownerId)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get current owner profile
  async getCurrentOwner(): Promise<DatabaseResponse<Owner>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: null, error: 'No authenticated user' };
      }

      const { data, error } = await supabase
        .from('owners')
        .select('*')
        .eq('id', user.id)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Update owner profile
  async updateOwner(ownerId: string, updates: Partial<Owner>): Promise<DatabaseResponse<Owner>> {
    try {
      const { data, error } = await supabase
        .from('owners')
        .update(updates)
        .eq('id', ownerId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }
};

// =====================================================
// AGENT SERVICES
// =====================================================

export const agentService = {
  // Create new agent
  async createAgent(agentData: AgentRegistrationData, userId: string): Promise<DatabaseResponse<Agent>> {
    try {
      const insertData = {
        id: userId,
        ...agentData
      };
      console.log('Insertando en agents:', insertData);

      const { data, error } = await supabase
        .from('agents')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('❌ Error al crear perfil de agente:', error);
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('❌ Error inesperado al crear perfil de agente:', error);
      return { data: null, error };
    }
  },

  // Get agent by ID
  async getAgentById(agentId: string): Promise<DatabaseResponse<Agent>> {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('id', agentId)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get current agent profile
  async getCurrentAgent(): Promise<DatabaseResponse<Agent>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: null, error: 'No authenticated user' };
      }

      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('id', user.id)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Update agent profile
  async updateAgent(agentId: string, updates: Partial<Agent>): Promise<DatabaseResponse<Agent>> {
    try {
      const { data, error } = await supabase
        .from('agents')
        .update(updates)
        .eq('id', agentId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }
};

// =====================================================
// PROPERTY SERVICES
// =====================================================

export const propertyService = {
  // Create new property
  async createProperty(propertyData: PropertyCreationData, ownerId: string): Promise<DatabaseResponse<Property>> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .insert({
          ...propertyData,
          owner_id: ownerId
        })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get property by ID
  async getPropertyById(propertyId: string): Promise<DatabaseResponse<PropertyWithOwner>> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          owner:owners(*)
        `)
        .eq('id', propertyId)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get all properties
  async getAllProperties(): Promise<DatabaseResponse<PropertyWithOwner[]>> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          owner:owners(*)
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get properties by owner
  async getPropertiesByOwner(ownerId: string): Promise<DatabaseResponse<Property[]>> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Update property
  async updateProperty(propertyId: string, updates: Partial<Property>): Promise<DatabaseResponse<Property>> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .update(updates)
        .eq('id', propertyId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Delete property
  async deleteProperty(propertyId: string): Promise<DatabaseResponse<void>> {
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId);

      return { data: null, error };
    } catch (error) {
      return { data: null, error };
    }
  }
};

// =====================================================
// FAVORITES SERVICES
// =====================================================

export const favoritesService = {
  // Add property to favorites
  async addToFavorites(propertyId: string, agentId: string): Promise<DatabaseResponse<Favorite>> {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .insert({
          agent_id: agentId,
          property_id: propertyId
        })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Remove property from favorites
  async removeFromFavorites(propertyId: string, agentId: string): Promise<DatabaseResponse<void>> {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('agent_id', agentId)
        .eq('property_id', propertyId);

      return { data: null, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Check if property is favorited
  async isFavorited(propertyId: string, agentId: string): Promise<DatabaseResponse<boolean>> {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('agent_id', agentId)
        .eq('property_id', propertyId)
        .single();

      return { data: !!data, error };
    } catch (error) {
      return { data: false, error };
    }
  },

  // Get agent's favorite properties
  async getFavoriteProperties(agentId: string): Promise<DatabaseResponse<PropertyWithOwner[]>> {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          property:properties(
            *,
            owner:owners(*)
          )
        `)
        .eq('agent_id', agentId)
        .order('created_at', { ascending: false });

      const properties = data?.map((item: any) => item.property) || [];
      return { data: properties, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get properties with favorite status for current agent
  async getPropertiesWithFavorites(): Promise<DatabaseResponse<PropertyWithFavorites[]>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: null, error: 'No authenticated user' };
      }

      // Get all properties
      const { data: properties, error: propertiesError } = await propertyService.getAllProperties();
      if (propertiesError) throw propertiesError;

      // Get agent's favorites
      const { data: favorites, error: favoritesError } = await this.getFavoriteProperties(user.id);
      if (favoritesError) throw favoritesError;

      // Mark properties as favorited
      const propertiesWithFavorites = properties?.map(property => ({
        ...property,
        is_favorite: favorites?.some(fav => fav.id === property.id) || false
      })) || [];

      return { data: propertiesWithFavorites, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
};

// =====================================================
// CONTACTS SERVICES
// =====================================================

export const contactsService = {
  // Create contact request
  async createContact(propertyId: string, ownerId: string, agentId: string, message?: string): Promise<DatabaseResponse<Contact>> {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .insert({
          property_id: propertyId,
          owner_id: ownerId,
          agent_id: agentId,
          message
        })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get agent's contacts
  async getAgentContacts(agentId: string): Promise<DatabaseResponse<Contact[]>> {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('agent_id', agentId)
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get owner's contacts
  async getOwnerContacts(ownerId: string): Promise<DatabaseResponse<Contact[]>> {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Update contact status
  async updateContactStatus(contactId: string, status: 'pending' | 'accepted' | 'rejected' | 'completed'): Promise<DatabaseResponse<Contact>> {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .update({ contact_status: status })
        .eq('id', contactId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }
}; 