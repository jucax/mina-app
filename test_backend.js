// Test script to check backend password recovery functionality
const fetch = require('node-fetch');

const BACKEND_URL = 'https://mina-app-ten.vercel.app';

async function testBackend() {
  console.log('🧪 Testing Backend Password Recovery...\n');

  // Test 1: Check if backend is up and environment is configured
  console.log('1️⃣ Testing backend info...');
  try {
    const response = await fetch(`${BACKEND_URL}/api/debug/info`);
    const data = await response.json();
    console.log('✅ Backend Info:', data);
    
    if (!data.hasSupabaseAdmin) {
      console.log('❌ Supabase admin not configured. Check environment variables.');
      return;
    }
  } catch (error) {
    console.log('❌ Backend not accessible:', error.message);
    return;
  }

  // Test 2: Test the verification logic step by step
  console.log('\n2️⃣ Testing verification logic...');
  try {
    const response = await fetch(`${BACKEND_URL}/api/debug/test-verify`);
    const data = await response.json();
    console.log('✅ Verification Test Result:', JSON.stringify(data, null, 2));
    
    if (data.step === 'success') {
      console.log('✅ All verification steps passed!');
    } else {
      console.log(`❌ Failed at step: ${data.step}`);
      if (data.error) {
        console.log('Error:', data.error);
      }
    }
  } catch (error) {
    console.log('❌ Verification test failed:', error.message);
  }

  // Test 3: Test the actual verification endpoint
  console.log('\n3️⃣ Testing verification endpoint...');
  try {
    const testData = {
      email: 'realstatemina@gmail.com',
      name: 'Mina Team',
      phone: '5545024076'
    };
    
    const response = await fetch(`${BACKEND_URL}/api/password-recovery/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });
    
    const data = await response.json();
    console.log('✅ Verification Endpoint Result:', JSON.stringify(data, null, 2));
    
    if (data.found) {
      console.log('✅ Account verification successful!');
    } else {
      console.log('❌ Account verification failed');
    }
  } catch (error) {
    console.log('❌ Verification endpoint test failed:', error.message);
  }

  console.log('\n🏁 Backend testing complete!');
}

testBackend().catch(console.error);
