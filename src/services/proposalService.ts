import { supabase } from './supabase';

export interface Proposal {
  id: string;
  property_id: string;
  agent_id: string;
  owner_id: string;
  proposal_text: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  
  // Joined data
  agent?: {
    full_name: string;
    avatar_url?: string;
    agency_name?: string;
    experience_years?: number;
    properties_sold?: number;
    commission_percentage?: number;
  };
  property?: {
    property_type: string;
    intent: string;
    price: number;
    municipality: string;
    state: string;
    images?: string[];
  };
  owner?: {
    full_name: string;
    email: string;
    phone: string;
  };
}

export interface CreateProposalData {
  property_id: string;
  proposal_text: string;
}

export class ProposalService {
  // Create a new proposal
  static async createProposal(data: CreateProposalData): Promise<Proposal | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // Get agent_id from user_auth
      const { data: userAuth, error: userAuthError } = await supabase
        .from('user_auth')
        .select('agent_id')
        .eq('id', user.id)
        .single();

      if (userAuthError || !userAuth?.agent_id) {
        throw new Error('Usuario no es un agente válido');
      }

      // Get property and owner information
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .select('owner_id')
        .eq('id', data.property_id)
        .single();

      if (propertyError || !property) {
        throw new Error('Propiedad no encontrada');
      }

      // Create the proposal
      const { data: proposal, error } = await supabase
        .from('proposals')
        .insert({
          property_id: data.property_id,
          agent_id: userAuth.agent_id,
          owner_id: property.owner_id,
          proposal_text: data.proposal_text,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating proposal:', error);
        throw error;
      }

      return proposal;
    } catch (error) {
      console.error('Error in createProposal:', error);
      throw error;
    }
  }

  // Get proposals for a property owner
  static async getProposalsForOwner(): Promise<Proposal[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // Get owner_id from user_auth
      const { data: userAuth, error: userAuthError } = await supabase
        .from('user_auth')
        .select('owner_id')
        .eq('id', user.id)
        .single();

      if (userAuthError || !userAuth?.owner_id) {
        throw new Error('Usuario no es un propietario válido');
      }

      const { data: proposals, error } = await supabase
        .from('proposals')
        .select(`
          *,
          agent:agents(
            full_name,
            avatar_url,
            agency_name,
            experience_years,
            properties_sold,
            commission_percentage
          ),
          property:properties(
            property_type,
            intent,
            price,
            municipality,
            state,
            images
          )
        `)
        .eq('owner_id', userAuth.owner_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching proposals:', error);
        throw error;
      }

      return proposals || [];
    } catch (error) {
      console.error('Error in getProposalsForOwner:', error);
      throw error;
    }
  }

  // Get a specific proposal by ID with proper error handling
  static async getProposalById(id: string): Promise<Proposal | null> {
    try {
      console.log('🔍 Fetching proposal with ID:', id);
      
      // First, get the basic proposal data
      const { data: proposal, error: proposalError } = await supabase
        .from('proposals')
        .select('*')
        .eq('id', id)
        .single();

      if (proposalError) {
        console.error('❌ Error fetching proposal:', proposalError);
        if (proposalError.code === 'PGRST116') {
          throw new Error('Propuesta no encontrada');
        }
        throw proposalError;
      }

      if (!proposal) {
        console.log('❌ No proposal found');
        return null;
      }

      console.log('✅ Proposal found:', proposal);

      // Try to fetch agent data
      let agentData = null;
      if (proposal.agent_id) {
        console.log('🔍 Fetching agent data for ID:', proposal.agent_id);
        
        const { data: agent, error: agentError } = await supabase
          .from('agents')
          .select(`
            full_name,
            avatar_url,
            agency_name,
            experience_years,
            properties_sold,
            commission_percentage
          `)
          .eq('id', proposal.agent_id)
          .maybeSingle();

        if (agentError) {
          console.error('❌ Error fetching agent data:', agentError);
        } else if (agent) {
          console.log('✅ Agent data found:', agent);
          agentData = agent;
        } else {
          console.log('⚠️ Agent not found with ID:', proposal.agent_id);
        }
      }

      // Try to fetch property data
      let propertyData = null;
      if (proposal.property_id) {
        console.log('🔍 Fetching property data for ID:', proposal.property_id);
        
        const { data: property, error: propertyError } = await supabase
          .from('properties')
          .select(`
            property_type,
            intent,
            price,
            municipality,
            state,
            images
          `)
          .eq('id', proposal.property_id)
          .maybeSingle();

        if (propertyError) {
          console.error('❌ Error fetching property data:', propertyError);
        } else if (property) {
          console.log('✅ Property data found:', property);
          propertyData = property;
        } else {
          console.log('⚠️ Property not found with ID:', proposal.property_id);
        }
      }

      // Try to fetch owner data
      let ownerData = null;
      if (proposal.owner_id) {
        console.log('🔍 Fetching owner data for ID:', proposal.owner_id);
        
        const { data: owner, error: ownerError } = await supabase
          .from('owners')
          .select(`
            full_name,
            email,
            phone
          `)
          .eq('id', proposal.owner_id)
          .maybeSingle();

        if (ownerError) {
          console.error('❌ Error fetching owner data:', ownerError);
        } else if (owner) {
          console.log('✅ Owner data found:', owner);
          ownerData = owner;
        } else {
          console.log('⚠️ Owner not found with ID:', proposal.owner_id);
        }
      }

      // Combine all data
      const fullProposal: Proposal = {
        ...proposal,
        agent: agentData,
        property: propertyData,
        owner: ownerData,
      };

      console.log('✅ Final proposal with all data:', fullProposal);
      return fullProposal;

    } catch (error) {
      console.error('❌ Error in getProposalById:', error);
      throw error;
    }
  }

  // Update proposal status (accept/reject)
  static async updateProposalStatus(id: string, status: 'accepted' | 'rejected'): Promise<void> {
    try {
      const { error } = await supabase
        .from('proposals')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        console.error('Error updating proposal status:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in updateProposalStatus:', error);
      throw error;
    }
  }

  // Get proposals by agent
  static async getProposalsByAgent(): Promise<Proposal[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // Get agent_id from user_auth
      const { data: userAuth, error: userAuthError } = await supabase
        .from('user_auth')
        .select('agent_id')
        .eq('id', user.id)
        .single();

      if (userAuthError || !userAuth?.agent_id) {
        throw new Error('Usuario no es un agente válido');
      }

      const { data: proposals, error } = await supabase
        .from('proposals')
        .select(`
          *,
          property:properties(
            property_type,
            intent,
            price,
            municipality,
            state,
            images
          ),
          owner:owners(
            full_name,
            email,
            phone
          )
        `)
        .eq('agent_id', userAuth.agent_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching agent proposals:', error);
        throw error;
      }

      return proposals || [];
    } catch (error) {
      console.error('Error in getProposalsByAgent:', error);
      throw error;
    }
  }

  // Get agent proposal count for a specific property
  static async getAgentProposalCountForProperty(propertyId: string): Promise<number> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // Get agent_id from user_auth
      const { data: userAuth, error: userAuthError } = await supabase
        .from('user_auth')
        .select('agent_id')
        .eq('id', user.id)
        .single();

      if (userAuthError || !userAuth?.agent_id) {
        throw new Error('Usuario no es un agente válido');
      }

      const { count, error } = await supabase
        .from('proposals')
        .select('*', { count: 'exact' })
        .eq('agent_id', userAuth.agent_id)
        .eq('property_id', propertyId);

      if (error) {
        console.error('Error fetching proposal count:', error);
        throw error;
      }

      return count || 0;
    } catch (error) {
      console.error('Error in getAgentProposalCountForProperty:', error);
      throw error;
    }
  }
}
