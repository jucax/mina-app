import { supabase } from './supabase';
import { SubscriptionService } from './subscriptionService';

export interface SubscriptionStatus {
  isActive: boolean;
  plan: string | null;
  startDate: string | null;
  endDate: string | null;
  daysRemaining: number | null;
  status: 'inactive' | 'active' | 'expired' | 'cancelled';
  message: string | null;
}

export class SubscriptionTrackingService {
  // Calculate subscription end date based on plan
  static calculateEndDate(plan: string, startDate: Date = new Date()): Date {
    const endDate = new Date(startDate);
    
    switch (plan.toLowerCase()) {
      case 'mensual':
      case 'monthly':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case 'semestral':
      case 'semiannual':
        endDate.setMonth(endDate.getMonth() + 6);
        break;
      case 'anual':
      case 'yearly':
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
      default:
        // Default to monthly if unknown plan
        endDate.setMonth(endDate.getMonth() + 1);
    }
    
    return endDate;
  }

  // Update agent subscription after successful payment
  static async updateAgentSubscription(
    agentId: string, 
    plan: string, 
    stripeCustomerId?: string,
    stripeSubscriptionId?: string
  ): Promise<boolean> {
    try {
      console.log('🔄 Updating agent subscription:', { agentId, plan, stripeCustomerId, stripeSubscriptionId });
      
      // Map plan ID to plan type
      const planTypeMap = {
        'mensual': 'monthly' as const,
        'semestral': 'semiannual' as const,
        'anual': 'yearly' as const
      };

      const planType = planTypeMap[plan as keyof typeof planTypeMap];
      if (!planType) {
        console.error('❌ Invalid plan type:', plan);
        return false;
      }

      // Calculate subscription period
      const now = new Date();
      const periodEnd = new Date();
      
      switch (planType) {
        case 'monthly':
          periodEnd.setMonth(periodEnd.getMonth() + 1);
          break;
        case 'semiannual':
          periodEnd.setMonth(periodEnd.getMonth() + 6);
          break;
        case 'yearly':
          periodEnd.setFullYear(periodEnd.getFullYear() + 1);
          break;
      }

      // Create subscription record using the new service
      const subscriptionData = {
        agent_id: agentId,
        stripe_customer_id: stripeCustomerId,
        stripe_subscription_id: stripeSubscriptionId,
        plan_type: planType,
        status: 'active' as const,
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
        cancel_at_period_end: false,
      };

      const subscription = await SubscriptionService.createSubscription(subscriptionData);
      
      if (subscription) {
        console.log('✅ Agent subscription updated successfully:', subscription);
        return true;
      } else {
        console.error('❌ Failed to create subscription record');
        return false;
      }
    } catch (error) {
      console.error('❌ Error updating agent subscription:', error);
      return false;
    }
  }

  // Get agent subscription status
  static async getAgentSubscriptionStatus(agentId: string): Promise<SubscriptionStatus> {
    try {
      console.log('🔍 Getting subscription status for agent:', agentId);
      
      const validity = await SubscriptionService.checkSubscriptionValidity(agentId);
      
      return {
        isActive: validity.is_valid,
        plan: validity.plan_type,
        startDate: null, // We can add this if needed
        endDate: validity.expires_at,
        daysRemaining: validity.days_remaining,
        status: validity.is_valid ? 'active' : 'expired',
        message: SubscriptionService.getSubscriptionExpirationMessage(validity)
      };
    } catch (error) {
      console.error('❌ Error getting agent subscription status:', error);
      return {
        isActive: false,
        plan: null,
        startDate: null,
        endDate: null,
        daysRemaining: 0,
        status: 'inactive',
        message: 'Error al verificar el estado de la suscripción'
      };
    }
  }

  // Check if agent should be redirected to subscription screen
  static async shouldRedirectToSubscription(agentId: string): Promise<boolean> {
    try {
      const status = await this.getAgentSubscriptionStatus(agentId);
      return !status.isActive;
    } catch (error) {
      console.error('❌ Error checking if should redirect to subscription:', error);
      return true; // Redirect to subscription on error
    }
  }

  // Get subscription renewal URL (for Stripe)
  static async getSubscriptionRenewalUrl(agentId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('stripe_customer_id, stripe_subscription_id')
        .eq('id', agentId)
        .single();

      if (error) {
        console.error('❌ Error getting agent Stripe data:', error);
        return null;
      }

      // If we have a Stripe customer ID, we can create a renewal URL
      if (data.stripe_customer_id) {
        // This would typically involve calling your backend to create a Stripe checkout session
        // For now, we'll return null
        return null;
      }

      return null;
    } catch (error) {
      console.error('❌ Error getting subscription renewal URL:', error);
      return null;
    }
  }

  // Cancel subscription
  static async cancelSubscription(agentId: string): Promise<boolean> {
    try {
      console.log('🔄 Canceling subscription for agent:', agentId);
      
      const { data, error } = await supabase
        .from('agent_subscriptions')
        .update({
          status: 'canceled',
          cancel_at_period_end: true,
          canceled_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('agent_id', agentId)
        .eq('status', 'active');

      if (error) {
        console.error('❌ Error canceling subscription:', error);
        return false;
      }

      console.log('✅ Subscription canceled successfully');
      return true;
    } catch (error) {
      console.error('❌ Error canceling subscription:', error);
      return false;
    }
  }

  // Get subscription history
  static async getSubscriptionHistory(agentId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('agent_subscriptions')
        .select('*')
        .eq('agent_id', agentId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error getting subscription history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ Error getting subscription history:', error);
      return [];
    }
  }
}
