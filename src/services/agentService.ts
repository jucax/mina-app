import { supabase } from './supabase';
import { Agent, AgentFormData } from '../types/agent';

export class AgentService {
  // Create a new agent profile
  static async createAgent(formData: AgentFormData): Promise<Agent | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Validate required fields
      if (!formData.state) {
        throw new Error('State is required');
      }
      if (!formData.municipality) {
        throw new Error('Municipality is required');
      }
      if (!formData.commission_percentage) {
        throw new Error('Commission percentage is required');
      }

      // Transform form data to database format
      const agentData: Partial<Agent> = {
        user_id: user.id,
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        
        // Location
        country: formData.country,
        state: formData.state,
        municipality: formData.municipality,
        neighborhood: formData.neighborhood || undefined,
        street: formData.street,
        postal_code: formData.postal_code,
        
        // Professional Information
        experience_years: formData.experience_years ? parseInt(formData.experience_years) : undefined,
        properties_sold: formData.properties_sold ? parseInt(formData.properties_sold) : undefined,
        commission_percentage: formData.commission_percentage,
        
        // Agency Information
        works_at_agency: formData.works_at_agency,
        agency_name: formData.agency_name || undefined,
        
        // Description
        description: formData.description || undefined,
        
        // Subscription Information
        subscription_plan: formData.subscription_plan,
        subscription_status: 'active',
        subscription_start_date: new Date().toISOString(),
        
        // Status
        status: 'pending',
        is_verified: false
      };

      console.log('📝 Agent form data being saved:', formData);
      console.log('💾 Agent data to insert:', agentData);

      const { data, error } = await supabase
        .from('agents')
        .insert(agentData)
        .select()
        .single();

      if (error) {
        console.error('Error creating agent:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in createAgent:', error);
      throw error;
    }
  }

  // Get agent profile by user ID
  static async getAgentByUserId(userId: string): Promise<Agent | null> {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching agent:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in getAgentByUserId:', error);
      throw error;
    }
  }

  // Get agent profile by agent ID
  static async getAgentById(id: string): Promise<Agent | null> {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching agent:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in getAgentById:', error);
      throw error;
    }
  }

  // Get all agents (for admin purposes)
  static async getAllAgents(): Promise<Agent[]> {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching all agents:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllAgents:', error);
      throw error;
    }
  }

  // Update agent profile
  static async updateAgent(id: string, updates: Partial<Agent>): Promise<Agent | null> {
    try {
      const { data, error } = await supabase
        .from('agents')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating agent:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in updateAgent:', error);
      throw error;
    }
  }

  // Update agent subscription
  static async updateAgentSubscription(
    id: string, 
    plan: 'basic' | 'premium' | 'enterprise',
    status: 'active' | 'cancelled' | 'expired' = 'active'
  ): Promise<Agent | null> {
    try {
      const updates = {
        subscription_plan: plan,
        subscription_status: status,
        subscription_start_date: new Date().toISOString(),
        subscription_end_date: status === 'active' ? 
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : // 30 days from now
          undefined
      };

      return await this.updateAgent(id, updates);
    } catch (error) {
      console.error('Error in updateAgentSubscription:', error);
      throw error;
    }
  }

  // Approve agent
  static async approveAgent(id: string): Promise<Agent | null> {
    try {
      return await this.updateAgent(id, { 
        status: 'approved',
        is_verified: true 
      });
    } catch (error) {
      console.error('Error in approveAgent:', error);
      throw error;
    }
  }

  // Reject agent
  static async rejectAgent(id: string): Promise<Agent | null> {
    try {
      return await this.updateAgent(id, { status: 'rejected' });
    } catch (error) {
      console.error('Error in rejectAgent:', error);
      throw error;
    }
  }

  // Suspend agent
  static async suspendAgent(id: string): Promise<Agent | null> {
    try {
      return await this.updateAgent(id, { status: 'suspended' });
    } catch (error) {
      console.error('Error in suspendAgent:', error);
      throw error;
    }
  }

  // Delete agent
  static async deleteAgent(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting agent:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in deleteAgent:', error);
      throw error;
    }
  }
} 