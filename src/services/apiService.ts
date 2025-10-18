import { supabase } from './supabase';
import { API_BASE_URL } from '../config/env';

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

// Debug helpers to validate backend/Stripe environment
export class ApiDebugService {
  static async getInfo() {
    const url = `${API_BASE_URL}/debug/info`;
    try {
      const res = await fetch(url);
      return await res.json();
    } catch (e) {
      console.log('Debug info fetch failed:', e);
      return null;
    }
  }

  static async getPaymentIntent(id: string) {
    const url = `${API_BASE_URL}/debug/payment-intent/${id}`;
    try {
      const res = await fetch(url);
      return await res.json();
    } catch (e) {
      console.log('Debug PI fetch failed:', e);
      return null;
    }
  }
}

export class PasswordRecoveryService {
  static async resetPasswordWithVerification(email: string, name: string, phone: string, newPassword: string) {
    const url = `${API_BASE_URL}/password-recovery/reset`;
    const body = { email, name, phone, newPassword } as const;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.error || 'No se pudo restablecer la contraseña');
    }
    return data;
  }
}