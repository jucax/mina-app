const express = require('express');
const stripe = require('stripe')('sk_test_51RfA9iP88QQAZhC3iXEK1uRLFNX1O4c4D9G6AhW6UzKHwF34Qf8VjiVI1W83TfLue8xlJwY8BzvQPuCSDhxHVjOa00eucPbJxd');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Create payment intent
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { planId, amount, currency, customerId } = req.body;
    
    console.log('Creating payment intent:', { planId, amount, currency, customerId });
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      customer: customerId,
      metadata: { planId },
    });

    console.log('Payment intent created:', paymentIntent.id);
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error creating payment intent:', error);
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
    
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
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