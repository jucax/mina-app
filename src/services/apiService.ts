import { supabase } from './supabase';

const API_BASE_URL = 'https://your-backend-url.com/api'; // Replace with your actual backend URL

export class ApiService {
  // Create payment intent
  static async createPaymentIntent(planId: string, amount: number, currency: string = 'mxn') {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('User not authenticated');
      }

      // In a real implementation, this would call your backend
      // For now, we'll simulate the response
      const response = await fetch(`${API_BASE_URL}/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          planId,
          amount,
          currency,
          customerId: session.user.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating payment intent:', error);
      // For demo purposes, return a mock response
      return {
        clientSecret: 'pi_mock_secret_' + Date.now(),
        success: true,
      };
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
        throw new Error('Failed to confirm payment');
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
        throw new Error('Failed to create subscription');
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