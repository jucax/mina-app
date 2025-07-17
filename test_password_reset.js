const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = 'https://tliwzfdnpeozlanhpxmn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsaXd6ZmRucGVvemxhbmhweG1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MzY2MzksImV4cCI6MjA2NTUxMjYzOX0.1EY13lSb0UjsqNoqGJEK7Hgh4SBJ9LxBr3Llt89am44';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test function to check if user exists
async function checkUserExists(email) {
  try {
    console.log(`🔍 Checking if user exists: ${email}`);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: 'dummy_password_for_existence_check',
    });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        console.log('✅ User exists (invalid credentials error)');
        return { userExists: true, error: null };
      } else if (error.message.includes('Email not confirmed')) {
        console.log('✅ User exists but email not confirmed');
        return { userExists: true, error: null };
      } else if (error.message.includes('User not found') || error.message.includes('Unable to validate email address')) {
        console.log('❌ User does not exist');
        return { userExists: false, error: null };
      } else {
        console.log('❓ Unknown error, assuming user does not exist:', error.message);
        return { userExists: false, error: error.message };
      }
    }

    console.log('✅ User exists (no error)');
    return { userExists: true, error: null };
  } catch (error) {
    console.error('❌ Error checking user existence:', error.message);
    return { userExists: false, error: error.message };
  }
}

// Test function to send password reset email
async function sendPasswordResetEmail(email) {
  try {
    console.log(`📧 Sending password reset email to: ${email}`);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'mina-app://reset-password',
    });

    if (error) {
      console.error('❌ Password reset error:', error.message);
      return { success: false, error: error.message };
    }

    console.log('✅ Password reset email sent successfully');
    return { success: true, error: null };
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    return { success: false, error: error.message };
  }
}

// Test scenarios
async function runTests() {
  console.log('🧪 Testing Password Reset Functionality\n');

  // Test 1: Non-existent email
  console.log('=== Test 1: Non-existent email ===');
  const testEmail1 = 'nonexistent@example.com';
  const result1 = await checkUserExists(testEmail1);
  console.log(`Result: ${result1.userExists ? 'User exists' : 'User does not exist'}\n`);

  // Test 2: Valid email (you should replace this with a real email from your database)
  console.log('=== Test 2: Valid email ===');
  const testEmail2 = 'test@example.com'; // Replace with a real email from your database
  const result2 = await checkUserExists(testEmail2);
  console.log(`Result: ${result2.userExists ? 'User exists' : 'User does not exist'}\n`);

  // Test 3: Invalid email format
  console.log('=== Test 3: Invalid email format ===');
  const testEmail3 = 'invalid-email';
  const result3 = await checkUserExists(testEmail3);
  console.log(`Result: ${result3.userExists ? 'User exists' : 'User does not exist'}\n`);

  // Test 4: Send password reset to non-existent email
  console.log('=== Test 4: Send password reset to non-existent email ===');
  const resetResult1 = await sendPasswordResetEmail(testEmail1);
  console.log(`Result: ${resetResult1.success ? 'Success' : 'Failed'} - ${resetResult1.error || 'No error'}\n`);

  // Test 5: Send password reset to valid email (only if user exists)
  if (result2.userExists) {
    console.log('=== Test 5: Send password reset to valid email ===');
    const resetResult2 = await sendPasswordResetEmail(testEmail2);
    console.log(`Result: ${resetResult2.success ? 'Success' : 'Failed'} - ${resetResult2.error || 'No error'}\n`);
  } else {
    console.log('=== Test 5: Skipped (no valid user found) ===\n');
  }

  console.log('✅ All tests completed!');
}

// Run the tests
runTests().catch(console.error); 