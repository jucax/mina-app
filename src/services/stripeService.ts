import { Alert } from 'react-native';
import { supabase } from './supabase';
import { ApiService } from './apiService';
import { useStripe, 
  useConfirmPayment,
  CardField,
  CardFieldInput,
  StripeProvider 
} from '@stripe/stripe-react-native';

// Stripe configuration - only the publishable key should be here
// For development, use test keys (pk_test_...)
// For production, use live keys (pk_live_...)
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51Rlf5QBGJZRArFn9GQCebcQ9bG6l5xcFV1SmBPYjmfwufTaRAFk8gAekbZsNJWU69GTISFl6E3n2LXdYdTnJqeEO00ypWNut9L'; // Test key for development
// SECRET KEY SHOULD ONLY BE IN BACKEND .env FILE - NEVER IN FRONTEND CODE

// Test mode configuration
const IS_TEST_MODE = true; // Set to true for development, false for production

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  stripePriceId: string; // Note: Currently not used in payment processing - using dynamic pricing instead
  features: string[];
  description: string;
}

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'mensual',
    name: 'Mensual',
    price: 500, // $500.0 MXN
    period: 'mes',
    stripePriceId: 'price_1RnuBaP9pd8KcDEZvBgxVyeD', // Legacy price ID - not used in current implementation
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
    price: 2500, // $2,500.0 MXN
    period: '6 meses',
    stripePriceId: 'price_1RnuBwP9pd8KcDEZ5bPfWcDI', // Legacy price ID - not used in current implementation
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
    price: 4500, // $4,500.0 MXN
    period: '12 meses',
    stripePriceId: 'price_1RnuCAP9pd8KcDEZpEuwZQv3', // Legacy price ID - not used in current implementation
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

      const amountInCents = plan.price * 100; // Convert to cents
      console.log('💳 Creating payment intent for plan:', plan.name);
      console.log('💰 Plan price:', plan.price, 'MXN');
      console.log('💸 Amount in cents:', amountInCents, 'cents =', amountInCents / 100, 'MXN');

      const result = await ApiService.createPaymentIntent(
        planId,
        amountInCents,
        'mxn'
      );

      return result;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  // Process payment using Stripe React Native SDK
  static async processPaymentWithStripeSDK(
    planId: string,
    clientSecret: string,
    cardDetails: CardFieldInput.Details
  ) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('🔍 Starting Stripe SDK payment processing...');
      console.log('📋 Plan ID:', planId);
      console.log('👤 User ID:', user.id);

      // Get the plan details
      const plan = subscriptionPlans.find(p => p.id === planId);
      if (!plan) {
        throw new Error('Invalid plan selected');
      }

      console.log('💰 Plan details:', {
        name: plan.name,
        price: plan.price,
        stripePriceId: plan.stripePriceId
      });

      // For now, just return success since we're using the payment intent flow
      // The actual payment processing happens in the useStripePayment hook
      console.log('✅ Payment intent created, ready for confirmation');
      
      return {
        success: true,
        message: 'Payment intent created successfully',
        planId: planId,
        amount: plan.price
      };
    } catch (error) {
      console.error('❌ Error processing payment:', error);
      throw error;
    }
  }

  // Create subscription via backend
  private static async createSubscriptionViaBackend(priceId: string, customerId: string) {
    try {
      console.log('📅 Creating subscription via backend...');
      
      const response = await fetch('https://mina-app-ten.vercel.app/api/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: priceId,
          customerId: customerId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Backend subscription creation failed:', errorData);
        throw new Error(errorData.error?.message || 'Failed to create subscription');
      }

      const subscription = await response.json();
      console.log('✅ Subscription created via backend:', subscription.subscription.id);
      return subscription.subscription;
    } catch (error) {
      console.error('❌ Error creating subscription via backend:', error);
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

  // Get amount in cents for Stripe
  static getAmountInCents(price: number): number {
    return Math.round(price * 100); // Convert pesos to cents
  }

  // Check if we're in test mode
  static isTestMode(): boolean {
    return IS_TEST_MODE;
  }
}

// Hook for using Stripe in components
export const useStripePayment = () => {
  const { confirmPayment } = useConfirmPayment();

  const processPayment = async (
    planId: string,
    clientSecret: string,
    cardDetails: CardFieldInput.Details
  ) => {
    try {
      console.log('💳 Confirming payment with Stripe SDK...');
      // Debug: Log the clientSecret being used
      console.log('Frontend clientSecret:', clientSecret);
      // Get user email for billing details
      const { data: { user } } = await supabase.auth.getUser();
      const userEmail = user?.email || 'test@example.com';
      
      console.log('📧 Using email for billing:', userEmail);
      
      const { error, paymentIntent } = await confirmPayment(
        clientSecret,
        {
          paymentMethodType: 'Card',
          paymentMethodData: {
            billingDetails: {
              email: userEmail,
              name: 'Test User', // You can get this from user data if available
            },
          },
        }
      );

      if (error) {
        console.error('❌ Payment confirmation failed:', error);
        // Don't throw error, return it for better handling
        return { error, success: false };
      }

      if (paymentIntent) {
        console.log('✅ Payment confirmed:', paymentIntent.status);
        return { paymentIntent, success: true };
      }
      
      return { error: 'No payment intent returned', success: false };
    } catch (error) {
      console.error('❌ Error confirming payment:', error);
      return { error, success: false };
    }
  };

  return { processPayment };
};
