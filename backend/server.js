const express = require('express');
require('dotenv').config(); // Add dotenv for local env support
// Use environment variable for Stripe secret key
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
// Make sure to set STRIPE_SECRET_KEY in your .env file for production
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const LOG_FILE = path.join(__dirname, 'public', 'mina-backend.log');
const { createClient } = require('@supabase/supabase-js');

// Supabase admin client for secure operations (password reset)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = (supabaseUrl && supabaseServiceKey)
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

function logToFile(obj) {
  const line = JSON.stringify({ ...obj, timestamp: new Date().toISOString() }) + '\n';
  fs.appendFile(LOG_FILE, line, err => { if (err) console.error('Log file error:', err); });
}

const app = express();
app.use(cors());
app.use(express.json());

// Basic request logger to help trace issues end-to-end
app.use((req, res, next) => {
  const authHeader = req.headers['authorization'];
  logToFile({ event: 'request', method: req.method, path: req.path, hasAuthHeader: Boolean(authHeader), origin: req.headers['origin'] });
  next();
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve debug page at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'debug.html'));
});

// Serve logs as JSON
app.get('/logs', (req, res) => {
  fs.readFile(LOG_FILE, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Could not read log file' });
    const lines = data.trim().split('\n').filter(Boolean).map(line => {
      try { return JSON.parse(line); } catch { return { raw: line }; }
    });
    res.json(lines.slice(-100)); // last 100 entries
  });
});

// Log all payment intent requests
app.post('/api/create-payment-intent', async (req, res) => {
  logToFile({ event: 'create-payment-intent', body: req.body });
  try {
    const { planId, amount, currency, customerId, email } = req.body;
    console.log('Creating payment intent:', { planId, amount, currency, customerId, email });
    console.log('Stripe livemode from secret key:', process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_') ? true : false);
    console.log('💰 Amount received:', amount, 'cents =', amount / 100, 'MXN');

    if (!amount || typeof amount !== 'number') {
      return res.status(400).json({ error: 'Amount is required and must be a number (in cents).' });
    }
    if (currency !== 'mxn') {
      console.log('Warning: currency provided is not mxn ->', currency);
    }
    if (amount < 1000) {
      return res.status(400).json({ error: 'Amount must be at least $10.00 mxn' });
    }

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
    // Debug: Log the client secret and customer ID
    console.log('🔑 Returning to frontend:', {
      clientSecret: paymentIntent.client_secret,
      customerId: customer.id,
      paymentIntentId: paymentIntent.id,
      livemode: !!paymentIntent.livemode,
    });
    res.json({ clientSecret: paymentIntent.client_secret, customerId: customer.id, paymentIntentId: paymentIntent.id, livemode: !!paymentIntent.livemode });
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
    logToFile({ event: 'confirm-payment', paymentIntentId });
    
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

// Debug: Get basic server/Stripe info to verify environment alignment
app.get('/api/debug/info', async (req, res) => {
  try {
    const isLive = process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_') ? true : false;
    let accountId = null;
    try {
      const acct = await stripe.accounts.retrieve();
      accountId = acct?.id || null;
    } catch (e) {
      console.log('Could not retrieve Stripe account info:', e?.message);
    }
    res.json({ 
      livemode: isLive, 
      accountId, 
      hasSupabaseAdmin: Boolean(supabaseAdmin),
      supabaseUrl: process.env.SUPABASE_URL ? 'SET' : 'NOT_SET',
      supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT_SET'
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Debug: Test password recovery verification endpoint
app.get('/api/debug/test-verify', async (req, res) => {
  try {
    if (!supabaseAdmin) {
      return res.json({ error: 'Supabase admin not configured', hasAdmin: false });
    }
    
    // Test with your account data
    const testEmail = 'realstatemina@gmail.com';
    const testName = 'Mina Team';
    const testPhone = '5545024076'; // Update this with your actual phone number from agents table
    
    const { data: userByEmail, error: getUserError } = await supabaseAdmin.auth.admin.getUserByEmail(testEmail);
    if (getUserError || !userByEmail?.user) {
      return res.json({ 
        step: 'user_lookup', 
        error: getUserError?.message || 'User not found',
        found: false 
      });
    }
    
    const user = userByEmail.user;
    const { data: userAuth, error: userAuthError } = await supabaseAdmin
      .from('user_auth')
      .select('owner_id, agent_id')
      .eq('id', user.id)
      .single();

    if (userAuthError || !userAuth) {
      return res.json({ 
        step: 'user_auth_lookup', 
        error: userAuthError?.message || 'No user_auth record',
        found: false 
      });
    }

    let profileData = null;
    if (userAuth.agent_id) {
      const { data: agent, error: agentError } = await supabaseAdmin
        .from('agents')
        .select('full_name, phone')
        .eq('id', userAuth.agent_id)
        .single();
      
      if (agentError || !agent) {
        return res.json({ 
          step: 'agent_lookup', 
          error: agentError?.message || 'No agent profile',
          found: false 
        });
      }
      profileData = agent;
    }

    return res.json({ 
      step: 'success', 
      found: true,
      user: { id: user.id, email: user.email },
      userAuth,
      profileData
    });
    
  } catch (e) {
    return res.status(500).json({ error: e.message, step: 'exception' });
  }
});

// Debug: Retrieve a PaymentIntent by id to confirm existence/mode/status
app.get('/api/debug/payment-intent/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const pi = await stripe.paymentIntents.retrieve(id);
    res.json({ id: pi.id, amount: pi.amount, currency: pi.currency, status: pi.status, livemode: !!pi.livemode, customer: pi.customer });
  } catch (e) {
    res.status(404).json({ error: e.message });
  }
});

// Verify account exists with name/email/phone (without updating password)
app.post('/api/password-recovery/verify', async (req, res) => {
  try {
    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Supabase admin not configured' });
    }
    const { email, name, phone } = req.body || {};
    if (!email || !name || !phone) {
      return res.status(400).json({ error: 'email, name, phone are required' });
    }
    console.log('🔐 Password recovery verification:', { email, name, phoneMasked: String(phone).slice(-4).padStart(String(phone).length, '*') });

    // First check if user exists in auth.users
    const { data: userByEmail, error: getUserError } = await supabaseAdmin.auth.admin.getUserByEmail(email);
    if (getUserError || !userByEmail?.user) {
      console.log('No user found for email:', email);
      return res.json({ found: false });
    }
    const user = userByEmail.user;

    // Get user_auth record to determine if user is owner or agent
    const { data: userAuth, error: userAuthError } = await supabaseAdmin
      .from('user_auth')
      .select('owner_id, agent_id')
      .eq('id', user.id)
      .single();

    if (userAuthError || !userAuth) {
      console.log('No user_auth record found for user:', user.id);
      return res.json({ found: false });
    }

    let profileData = null;
    
    // Check owners table if owner_id exists
    if (userAuth.owner_id) {
      const { data: owner, error: ownerError } = await supabaseAdmin
        .from('owners')
        .select('full_name, phone')
        .eq('id', userAuth.owner_id)
        .single();
      
      if (ownerError || !owner) {
        console.log('No owner profile found for user:', user.id);
        return res.json({ found: false });
      }
      profileData = owner;
    }
    // Check agents table if agent_id exists
    else if (userAuth.agent_id) {
      const { data: agent, error: agentError } = await supabaseAdmin
        .from('agents')
        .select('full_name, phone')
        .eq('id', userAuth.agent_id)
        .single();
      
      if (agentError || !agent) {
        console.log('No agent profile found for user:', user.id);
        return res.json({ found: false });
      }
      profileData = agent;
    }

    if (!profileData) {
      console.log('No profile data found for user:', user.id);
      return res.json({ found: false });
    }

    // Compare input with profile data
    const profileName = (profileData.full_name || '').toString().trim().toLowerCase();
    const profilePhone = (profileData.phone || '').toString().replace(/\D/g, '');
    const inputName = name.toString().trim().toLowerCase();
    const inputPhone = phone.toString().replace(/\D/g, '');

    if (!profileName || !profilePhone) {
      console.log('Incomplete profile data for user:', user.id);
      return res.json({ found: false });
    }
    if (profileName !== inputName || profilePhone !== inputPhone) {
      console.log('Name/phone mismatch for user:', user.id);
      return res.json({ found: false });
    }

    console.log('✅ Account verified for user:', user.id);
    return res.json({ found: true });
  } catch (e) {
    console.error('Password recovery verification error:', e);
    return res.status(500).json({ error: 'Unexpected error' });
  }
});

// Secure password reset (admin): verify name/email/phone and update password
app.post('/api/password-recovery/reset', async (req, res) => {
  try {
    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Supabase admin not configured' });
    }
    const { email, name, phone, newPassword } = req.body || {};
    if (!email || !name || !phone || !newPassword) {
      return res.status(400).json({ error: 'email, name, phone and newPassword are required' });
    }
    console.log('🔐 Password recovery requested:', { email, name, phoneMasked: String(phone).slice(-4).padStart(String(phone).length, '*') });
    logToFile({ event: 'password-recovery:request', email });

    // First check if user exists in auth.users
    const { data: userByEmail, error: getUserError } = await supabaseAdmin.auth.admin.getUserByEmail(email);
    if (getUserError) {
      console.log('Supabase getUserByEmail error:', getUserError.message);
      logToFile({ event: 'password-recovery:getUserError', error: getUserError.message });
      return res.status(404).json({ error: 'No user found for this email' });
    }
    const user = userByEmail?.user;
    if (!user) {
      return res.status(404).json({ error: 'No user found for this email' });
    }

    // Get user_auth record to determine if user is owner or agent
    const { data: userAuth, error: userAuthError } = await supabaseAdmin
      .from('user_auth')
      .select('owner_id, agent_id')
      .eq('id', user.id)
      .single();

    if (userAuthError || !userAuth) {
      logToFile({ event: 'password-recovery:noUserAuth', email });
      return res.status(400).json({ error: 'This account has incomplete profile data. Contact support.' });
    }

    let profileData = null;
    
    // Check owners table if owner_id exists
    if (userAuth.owner_id) {
      const { data: owner, error: ownerError } = await supabaseAdmin
        .from('owners')
        .select('full_name, phone')
        .eq('id', userAuth.owner_id)
        .single();
      
      if (ownerError || !owner) {
        logToFile({ event: 'password-recovery:noOwnerProfile', email });
        return res.status(400).json({ error: 'This account has incomplete profile data. Contact support.' });
      }
      profileData = owner;
    }
    // Check agents table if agent_id exists
    else if (userAuth.agent_id) {
      const { data: agent, error: agentError } = await supabaseAdmin
        .from('agents')
        .select('full_name, phone')
        .eq('id', userAuth.agent_id)
        .single();
      
      if (agentError || !agent) {
        logToFile({ event: 'password-recovery:noAgentProfile', email });
        return res.status(400).json({ error: 'This account has incomplete profile data. Contact support.' });
      }
      profileData = agent;
    }

    if (!profileData) {
      logToFile({ event: 'password-recovery:noProfileData', email });
      return res.status(400).json({ error: 'This account has incomplete profile data. Contact support.' });
    }

    // Compare input with profile data
    const profileName = (profileData.full_name || '').toString().trim().toLowerCase();
    const profilePhone = (profileData.phone || '').toString().replace(/\D/g, '');
    const inputName = name.toString().trim().toLowerCase();
    const inputPhone = phone.toString().replace(/\D/g, '');

    if (!profileName || !profilePhone) {
      logToFile({ event: 'password-recovery:incompleteProfile', email });
      return res.status(400).json({ error: 'This account has incomplete profile data. Contact support.' });
    }
    if (profileName !== inputName || profilePhone !== inputPhone) {
      logToFile({ event: 'password-recovery:mismatch', email });
      return res.status(401).json({ error: 'Name or phone does not match our records' });
    }

    // Update password via admin
    const { data: updated, error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(user.id, { password: newPassword });
    if (updateErr) {
      console.log('Supabase update password error:', updateErr.message);
      logToFile({ event: 'password-recovery:updateError', email, message: updateErr.message });
      return res.status(500).json({ error: 'Failed to update password' });
    }
    console.log('✅ Password updated for user:', user.id);
    logToFile({ event: 'password-recovery:success', userId: user.id });
    return res.json({ success: true });
  } catch (e) {
    console.error('Password recovery reset error:', e);
    logToFile({ event: 'password-recovery:exception', message: e?.message });
    return res.status(500).json({ error: 'Unexpected error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Update your app to use: http://localhost:${PORT}/api`);
}); 