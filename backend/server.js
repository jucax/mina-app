const express = require('express');
require('dotenv').config(); // Add dotenv for local env support
// Use environment variable for Stripe secret key
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_51RfA9iP88QQAZhC3iXEK1uRLFNX1O4c4D9G6AhW6UzKHwF34Qf8VjiVI1W83TfLue8xlJwY8BzvQPuCSDhxHVjOa00eucPbJxd');
// Make sure to set STRIPE_SECRET_KEY in your .env file for production
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Create payment intent
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { planId, amount, currency, customerId, email } = req.body;
    console.log('Creating payment intent:', { planId, amount, currency, customerId, email });
    console.log('💰 Amount received:', amount, 'cents =', amount / 100, 'MXN');

    let customer;
    if (email) {
      // Try to find customer by email
      const existingCustomers = await stripe.customers.list({ email, limit: 1 });
      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0];
        console.log('Found existing Stripe customer by email:', customer.id);
      } else {
        // Create new customer with email and metadata.userId
        customer = await stripe.customers.create({
          email,
          metadata: { userId: customerId },
        });
        console.log('Created new Stripe customer with email:', customer.id);
      }
    } else {
      // No email provided, always create a new customer with metadata.userId
      customer = await stripe.customers.create({
        metadata: { userId: customerId },
      });
      console.log('Created new Stripe customer (no email):', customer.id);
    }

    // Create payment intent
    const paymentIntentData = {
      amount,
      currency,
      metadata: { planId },
      customer: customer.id,
    };
    console.log('📦 Payment intent data being sent to Stripe:', paymentIntentData);
    const paymentIntent = await stripe.paymentIntents.create(paymentIntentData);
    console.log('✅ Payment intent created:', paymentIntent.id, 'Amount:', paymentIntent.amount, 'cents =', paymentIntent.amount / 100, 'MXN');
    res.json({ clientSecret: paymentIntent.client_secret, customerId: customer.id });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create or get customer
app.post('/api/create-customer', async (req, res) => {
  try {
    const { email, name, userId } = req.body;
    
    console.log('Creating/getting customer:', { email, name, userId });
    
    // Check if customer already exists
    const existingCustomers = await stripe.customers.list({
      email: email,
      limit: 1,
    });

    let customer;
    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
      console.log('Customer found:', customer.id);
    } else {
      customer = await stripe.customers.create({
        email: email,
        name: name,
        metadata: { userId: userId },
      });
      console.log('Customer created:', customer.id);
    }

    res.json({ customerId: customer.id });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: error.message });
  }
});

// Confirm payment
app.post('/api/confirm-payment', async (req, res) => {
  try {
    const { paymentIntentId, paymentMethodId } = req.body;
    
    console.log('Confirming payment:', { paymentIntentId, paymentMethodId });
    
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId,
    });

    console.log('Payment confirmed:', paymentIntent.status);
    res.json({ success: true, paymentIntent });
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create subscription
app.post('/api/create-subscription', async (req, res) => {
  try {
    const { planId, customerId } = req.body;
    
    console.log('Creating subscription:', { planId, customerId });
    
    // First create or get customer
    let customer;
    if (customerId) {
      try {
        customer = await stripe.customers.retrieve(customerId);
      } catch (error) {
        console.log('Customer not found, creating new one...');
        customer = await stripe.customers.create({
          metadata: { userId: customerId },
        });
      }
    } else {
      customer = await stripe.customers.create({
        metadata: { userId: 'unknown' },
      });
    }
    
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: planId }],
    });

    console.log('Subscription created:', subscription.id);
    res.json({ success: true, subscription });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Update your app to use: http://localhost:${PORT}/api`);
}); 