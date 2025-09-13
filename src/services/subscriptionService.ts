import { supabase } from './supabase';

export interface SubscriptionData {
  id?: string;
  agent_id: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  plan_type: 'monthly' | 'semiannual' | 'yearly';
  status: 'active' | 'canceled' | 'past_due' | 'incomplete' | 'incomplete_expired' | 'trialing' | 'unpaid';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  canceled_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SubscriptionValidity {
  is_valid: boolean;
  plan_type: string | null;
  expires_at: string | null;
  days_remaining: number;
}

export class SubscriptionService {
  // Create a new subscription record
  static async createSubscription(subscriptionData: Omit<SubscriptionData, 'id' | 'created_at' | 'updated_at'>): Promise<SubscriptionData | null> {
    try {
      console.log('🔄 Creating subscription for agent:', subscriptionData.agent_id);
      
      const { data, error } = await supabase
        .from('agent_subscriptions')
        .insert({
          ...subscriptionData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating subscription:', error);
        throw error;
      }

      console.log('✅ Subscription created successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Error in createSubscription:', error);
      throw error;
    }
  }

  // Get agent's current subscription
  static async getAgentSubscription(agentId: string): Promise<SubscriptionData | null> {
    try {
      console.log('🔍 Fetching subscription for agent:', agentId);
      
      const { data, error } = await supabase
        .from('agent_subscriptions')
        .select('*')
        .eq('agent_id', agentId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('ℹ️ No subscription found for agent:', agentId);
          return null;
        }
        if (error.code === '42P01') {
          console.log('ℹ️ agent_subscriptions table does not exist yet');
          return null;
        }
        console.error('❌ Error fetching subscription:', error);
        throw error;
      }

      console.log('✅ Subscription fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Error in getAgentSubscription:', error);
      return null; // Return null instead of throwing
    }
  }

  // Check if agent has valid subscription (simplified version)
  static async checkSubscriptionValidity(agentId: string): Promise<SubscriptionValidity> {
    try {
      console.log('🔍 Checking subscription validity for agent:', agentId);
      
      // First check if agent has subscription data in agents table
      const { data: agentData, error: agentError } = await supabase
        .from('agents')
        .select('current_plan_id, subscription_status, subscription_expires_at')
        .eq('id', agentId)
        .single();

      if (agentError) {
        console.log('ℹ️ Error fetching agent data:', agentError);
        return {
          is_valid: false,
          plan_type: null,
          expires_at: null,
          days_remaining: 0
        };
      }

      // If no current plan, agent has never subscribed
      if (!agentData?.current_plan_id) {
        console.log('ℹ️ Agent has never subscribed');
        return {
          is_valid: false,
          plan_type: null,
          expires_at: null,
          days_remaining: 0
        };
      }

      // Check if subscription status is active
      if (agentData.subscription_status !== 'active') {
        console.log('ℹ️ Agent subscription status is not active:', agentData.subscription_status);
        return {
          is_valid: false,
          plan_type: agentData.current_plan_id,
          expires_at: agentData.subscription_expires_at,
          days_remaining: 0
        };
      }

      // Check if subscription is expired
      if (agentData.subscription_expires_at) {
        const now = new Date();
        const expiresAt = new Date(agentData.subscription_expires_at);
        const isNotExpired = expiresAt > now;
        const daysRemaining = isNotExpired ? Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0;

        return {
          is_valid: isNotExpired,
          plan_type: agentData.current_plan_id,
          expires_at: agentData.subscription_expires_at,
          days_remaining: daysRemaining
        };
      }

      // Fallback: check detailed subscription table if it exists
      const subscription = await this.getAgentSubscription(agentId);
      
      if (!subscription) {
        console.log('ℹ️ No detailed subscription found');
        return {
          is_valid: false,
          plan_type: agentData.current_plan_id,
          expires_at: null,
          days_remaining: 0
        };
      }

      // Check if subscription is active and not expired
      const now = new Date();
      const expiresAt = new Date(subscription.current_period_end);
      const isActive = subscription.status === 'active';
      const isNotExpired = expiresAt > now;
      const isValid = isActive && isNotExpired;
      
      const daysRemaining = isValid ? Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0;

      const result = {
        is_valid: isValid,
        plan_type: subscription.plan_type,
        expires_at: subscription.current_period_end,
        days_remaining: daysRemaining
      };

      console.log('✅ Subscription validity check result:', result);
      return result;
    } catch (error) {
      console.error('❌ Error in checkSubscriptionValidity:', error);
      // Return invalid subscription on error
      return {
        is_valid: false,
        plan_type: null,
        expires_at: null,
        days_remaining: 0
      };
    }
  }

  // Update subscription status
  static async updateSubscriptionStatus(subscriptionId: string, updates: Partial<SubscriptionData>): Promise<SubscriptionData | null> {
    try {
      console.log('🔄 Updating subscription:', subscriptionId);
      
      const { data, error } = await supabase
        .from('agent_subscriptions')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscriptionId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating subscription:', error);
        throw error;
      }

      console.log('✅ Subscription updated successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Error in updateSubscriptionStatus:', error);
      throw error;
    }
  }

  // Get agent's subscription status from agents table
  static async getAgentSubscriptionStatus(agentId: string): Promise<{
    subscription_status: string;
    current_plan: string | null;
    subscription_expires_at: string | null;
  } | null> {
    try {
      console.log('🔍 Fetching agent subscription status:', agentId);
      
      const { data, error } = await supabase
        .from('agents')
        .select('subscription_status, current_plan, subscription_expires_at')
        .eq('id', agentId)
        .single();

      if (error) {
        console.error('❌ Error fetching agent subscription status:', error);
        throw error;
      }

      console.log('✅ Agent subscription status fetched:', data);
      return data;
    } catch (error) {
      console.error('❌ Error in getAgentSubscriptionStatus:', error);
      throw error;
    }
  }

  // Check if agent needs to be redirected to subscription screen
  static async shouldRedirectToSubscription(agentId: string): Promise<boolean> {
    try {
      const validity = await this.checkSubscriptionValidity(agentId);
      return !validity.is_valid;
    } catch (error) {
      console.error('❌ Error checking if should redirect to subscription:', error);
      return false; // Don't redirect on error
    }
  }

  // Get subscription expiration message
  static getSubscriptionExpirationMessage(validity: SubscriptionValidity): string {
    if (validity.is_valid) {
      if (validity.days_remaining <= 7) {
        return `Tu suscripción ${validity.plan_type} expira en ${validity.days_remaining} días. Considera renovar pronto.`;
      }
      return `Tu suscripción ${validity.plan_type} está activa.`;
    } else {
      return 'Tu suscripción ha expirado. Por favor, renueva tu plan para continuar usando la aplicación.';
    }
  }

  // Get plan display name
  static getPlanDisplayName(planType: string): string {
    const planNames = {
      'monthly': 'Mensual',
      'semiannual': 'Semestral',
      'yearly': 'Anual'
    };
    return planNames[planType as keyof typeof planNames] || planType;
  }

  // Get plan price (without IVA)
  static getPlanPrice(planType: string): number {
    const prices = {
      'monthly': 500,
      'semiannual': 2500,
      'yearly': 4500
    };
    return prices[planType as keyof typeof prices] || 0;
  }

  // Get plan price with IVA (16%)
  static getPlanPriceWithIVA(planType: string): number {
    const basePrice = this.getPlanPrice(planType);
    return Math.round(basePrice * 1.16);
  }

  // Calculate subscription end date based on plan
  static calculateEndDate(planType: string, startDate: Date = new Date()): Date {
    const endDate = new Date(startDate);
    
    switch (planType.toLowerCase()) {
      case 'monthly':
      case 'mensual':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case 'semiannual':
      case 'semestral':
        endDate.setMonth(endDate.getMonth() + 6);
        break;
      case 'yearly':
      case 'anual':
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
      default:
        // Default to monthly if unknown plan
        endDate.setMonth(endDate.getMonth() + 1);
    }
    
    return endDate;
  }
}
