import { supabase } from './supabase';

// For local development - change this to your actual backend URL in production
const API_BASE_URL = 'http://localhost:3000/api'; // Local development server

export class ApiService {
  // Create payment intent
  static async createPaymentIntent(planId: string, amount: number, currency: string = 'mxn') {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('User not authenticated');
      }

      console.log('🌐 Making request to:', `${API_BASE_URL}/create-payment-intent`);
      console.log('📦 Request data:', { planId, amount, currency, customerId: session.user.id });

      const response = await fetch(`${API_BASE_URL}/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          planId,
          amount: Math.round(amount), // Ensure amount is in cents
          currency,
          customerId: session.user.id,
          email: session.user.email, // Send email to backend
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Backend error:', errorData);
        throw new Error(errorData.error || 'Failed to create payment intent');
      }

      const data = await response.json();
      console.log('✅ Payment intent created successfully');
      return data;
    } catch (error) {
      console.error('❌ Error creating payment intent:', error);
      throw error; // Re-throw the error instead of falling back to mock
    }
  }

  // Confirm payment
  static async confirmPayment(paymentIntentId: string, paymentMethodId: string) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/confirm-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          paymentIntentId,
          paymentMethodId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to confirm payment');
      }

      return await response.json();
    } catch (error) {
      console.error('Error confirming payment:', error);
      // For demo purposes, return a mock response
      return {
        success: true,
        message: 'Payment confirmed successfully',
      };
    }
  }

  // Create subscription
  static async createSubscription(planId: string, customerId: string) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/create-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          planId,
          customerId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create subscription');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating subscription:', error);
      // For demo purposes, return a mock response
      return {
        success: true,
        subscriptionId: 'sub_mock_' + Date.now(),
        message: 'Subscription created successfully',
      };
    }
  }
} 