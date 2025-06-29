import { Alert } from 'react-native';
import { supabase } from './supabase';
import { ApiService } from './apiService';

// Stripe configuration - you'll need to replace these with your actual Stripe keys
const STRIPE_PUBLISHABLE_KEY = 'key'; // Replace with your actual publishable key
const STRIPE_SECRET_KEY = 'key'; // This should be on your backend

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  stripePriceId: string;
  features: string[];
  description: string;
}

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'mensual',
    name: 'Mensual',
    price: 1000,
    period: 'mes',
    stripePriceId: 'price_mensual_id', // Replace with your actual Stripe price ID
    features: [
      'Acceso a todas las propiedades',
      'Contacto directo con propietarios',
      'Notificaciones de nuevas propiedades',
      'Soporte prioritario'
    ],
    description: 'Pago mensual, cancela cuando quieras.'
  },
  {
    id: 'semestral',
    name: 'Semestral',
    price: 5400,
    period: '6 meses',
    stripePriceId: 'price_semestral_id', // Replace with your actual Stripe price ID
    features: [
      'Acceso a todas las propiedades',
      'Contacto directo con propietarios',
      'Notificaciones de nuevas propiedades',
      'Soporte prioritario'
    ],
    description: 'Pago semestral, ahorra más.'
  },
  {
    id: 'anual',
    name: 'Anual',
    price: 9600,
    period: '12 meses',
    stripePriceId: 'price_anual_id', // Replace with your actual Stripe price ID
    features: [
      'Acceso a todas las propiedades',
      'Contacto directo con propietarios',
      'Notificaciones de nuevas propiedades',
      'Soporte prioritario'
    ],
    description: 'Pago anual, la mejor tarifa.'
  }
];

export class StripeService {
  // Initialize Stripe (call this in your app initialization)
  static async initializeStripe() {
    try {
      // In a real app, you would initialize Stripe here
      // For now, we'll just return success
      console.log('Stripe initialized successfully');
      return true;
    } catch (error) {
      console.error('Error initializing Stripe:', error);
      return false;
    }
  }

  // Create a payment intent for subscription
  static async createPaymentIntent(planId: string, customerId?: string) {
    try {
      const plan = subscriptionPlans.find(p => p.id === planId);
      if (!plan) {
        throw new Error('Invalid plan selected');
      }

      const result = await ApiService.createPaymentIntent(
        planId,
        plan.price * 100, // Convert to cents
        'mxn'
      );

      return result.clientSecret;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  // Process payment with card details
  static async processPayment(
    planId: string,
    cardDetails: {
      number: string;
      expMonth: number;
      expYear: number;
      cvc: string;
    }
  ) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // In a real implementation, you would:
      // 1. Create a payment intent
      // 2. Confirm the payment with Stripe
      // 3. Create a subscription
      // 4. Update the user's subscription status

      // For now, we'll simulate a successful payment
      console.log('Processing payment for plan:', planId);
      console.log('Card details:', cardDetails);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update user subscription in database
      const { error } = await supabase
        .from('agents')
        .update({
          subscription_plan: planId,
          subscription_status: 'active',
          subscription_start_date: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      return {
        success: true,
        message: 'Payment processed successfully'
      };
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }

  // Get subscription plans
  static getSubscriptionPlans(): SubscriptionPlan[] {
    return subscriptionPlans;
  }

  // Get plan by ID
  static getPlanById(planId: string): SubscriptionPlan | undefined {
    return subscriptionPlans.find(plan => plan.id === planId);
  }

  // Format price for display
  static formatPrice(price: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
    }).format(price);
  }
} 