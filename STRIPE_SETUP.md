# Stripe Integration Setup Guide

This guide will help you set up Stripe payments for the Mina app subscription system.

## Prerequisites

1. A Stripe account (create one at https://stripe.com)
2. Your Stripe API keys
3. A backend server to handle Stripe webhooks and API calls

## Step 1: Get Your Stripe API Keys

1. Log in to your Stripe Dashboard
2. Go to Developers > API keys
3. Copy your **Publishable key** (starts with `pk_test_` or `pk_live_`)
4. Copy your **Secret key** (starts with `sk_test_` or `sk_live_`)

## Step 2: Update Configuration

### Update StripeService.ts

Replace the placeholder keys in `src/services/stripeService.ts`:

```typescript
const STRIPE_PUBLISHABLE_KEY = 'pk_test_your_actual_publishable_key_here';
const STRIPE_SECRET_KEY = 'sk_test_your_actual_secret_key_here';
```

### Update ApiService.ts

Replace the placeholder URL in `src/services/apiService.ts`:

```typescript
const API_BASE_URL = 'https://your-actual-backend-url.com/api';
```

## Step 3: Create Stripe Products and Prices

In your Stripe Dashboard:

1. Go to Products
2. Create three products:
   - **Mensual** (Monthly)
   - **Semestral** (Semester)
   - **Anual** (Annual)

3. For each product, create a price:
   - **Mensual**: $1,000 MXN / month
   - **Semestral**: $5,400 MXN / 6 months
   - **Anual**: $9,600 MXN / year

4. Copy the Price IDs (starts with `price_`) and update them in `stripeService.ts`:

```typescript
stripePriceId: 'price_your_actual_price_id_here'
```

## Step 4: Backend Setup

You'll need a backend server to handle Stripe API calls securely. Here's a basic Node.js/Express example:

### Install Dependencies

```bash
npm install stripe express cors
```

### Basic Backend Structure

```javascript
const express = require('express');
const stripe = require('stripe')('sk_test_your_secret_key');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Create payment intent
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { planId, amount, currency, customerId } = req.body;
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      customer: customerId,
      metadata: { planId },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Confirm payment
app.post('/api/confirm-payment', async (req, res) => {
  try {
    const { paymentIntentId, paymentMethodId } = req.body;
    
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId,
    });

    res.json({ success: true, paymentIntent });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create subscription
app.post('/api/create-subscription', async (req, res) => {
  try {
    const { planId, customerId } = req.body;
    
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: planId }],
    });

    res.json({ success: true, subscription });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

## Step 5: Test the Integration

1. Use Stripe's test card numbers:
   - **Success**: `4242 4242 4242 4242`
   - **Decline**: `4000 0000 0000 0002`
   - **Requires authentication**: `4000 0025 0000 3155`

2. Test the complete flow:
   - Select a subscription plan
   - Enter test card details
   - Complete payment
   - Verify subscription is activated

## Step 6: Production Deployment

1. Switch to live keys in production
2. Set up webhooks for subscription events
3. Implement proper error handling
4. Add security measures (rate limiting, input validation)
5. Set up monitoring and logging

## Security Considerations

- Never expose your secret key in the frontend
- Always validate payments on the backend
- Use HTTPS in production
- Implement proper authentication and authorization
- Handle webhook events securely

## Support

For more information, refer to:
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe React Native SDK](https://stripe.com/docs/stripe-react-native)
- [Stripe API Reference](https://stripe.com/docs/api) 