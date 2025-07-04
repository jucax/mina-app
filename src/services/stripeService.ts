import { Alert } from 'react-native';
import { supabase } from './supabase';
import { ApiService } from './apiService';

// Stripe configuration - you'll need to replace these with your actual Stripe keys
const STRIPE_PUBLISHABLE_KEY = ''; // Replace with your actual publishable key
const STRIPE_SECRET_KEY = ''; // This should be on your backend

// Test mode configuration
const IS_TEST_MODE = true; // Set to false for production

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
    stripePriceId: 'price_1RfAkQP88QQAZhC3iEHYOfQF',
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
    stripePriceId: 'price_1RfAksP88QQAZhC34D6VW4Gs',
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
    stripePriceId: 'price_1RfAlIP88QQAZhC3rjQ9ZhxF',
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
      if (IS_TEST_MODE) {
        console.log('🧪 Stripe initialized in TEST MODE');
        console.log('📋 Test card numbers:');
        console.log('   Success: 4242 4242 4242 4242');
        console.log('   Decline: 4000 0000 0000 0002');
        console.log('   Auth required: 4000 0025 0000 3155');
      } else {
        console.log('🚀 Stripe initialized in PRODUCTION MODE');
      }
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

      // Validate card details
      this.validateCardDetails(cardDetails);

      // In a real implementation, you would:
      // 1. Create a payment intent
      // 2. Confirm the payment with Stripe
      // 3. Create a subscription
      // 4. Update the user's subscription status

      console.log('💳 Processing payment for plan:', planId);
      console.log('📝 Card details:', cardDetails);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate different payment scenarios based on test card numbers
      const cardNumber = cardDetails.number.replace(/\s/g, '');
      
      if (IS_TEST_MODE) {
        if (cardNumber === '4000000000000002') {
          throw new Error('Tarjeta rechazada. Por favor intenta con otra tarjeta.');
        } else if (cardNumber === '4000000000009995') {
          throw new Error('Fondos insuficientes. Por favor verifica tu saldo.');
        } else if (cardNumber === '4000002500003155') {
          throw new Error('Autenticación requerida. Por favor completa la verificación.');
        }
      }

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

  // Validate card details
  private static validateCardDetails(cardDetails: {
    number: string;
    expMonth: number;
    expYear: number;
    cvc: string;
  }) {
    const cardNumber = cardDetails.number.replace(/\s/g, '');
    
    // Basic validation
    if (cardNumber.length < 13 || cardNumber.length > 19) {
      throw new Error('Número de tarjeta inválido');
    }
    
    if (cardDetails.expMonth < 1 || cardDetails.expMonth > 12) {
      throw new Error('Mes de expiración inválido');
    }
    
    const currentYear = new Date().getFullYear() % 100;
    if (cardDetails.expYear < currentYear) {
      throw new Error('Tarjeta expirada');
    }
    
    if (cardDetails.cvc.length < 3 || cardDetails.cvc.length > 4) {
      throw new Error('CVC inválido');
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

  // Check if we're in test mode
  static isTestMode(): boolean {
    return IS_TEST_MODE;
  }
} 