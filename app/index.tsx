// app/index.tsx

import React, { useEffect } from 'react';
import LoginScreen from '../src/screens/agent/LoginScreen';
import { supabase } from '../src/services/supabase';

export default function Index() {
  useEffect(() => {
    // Test Supabase connection
    const testConnection = async () => {
      try {
        // Test the connection by getting the current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Supabase connection error:', error.message);
        } else {
          console.log('✅ Supabase connected successfully!');
          console.log('Current session:', session ? 'User is logged in' : 'No active session');
        }
      } catch (error) {
        console.error('❌ Unexpected error testing Supabase connection:', error);
      }
    };

    testConnection();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 Auth state changed:', event);
      console.log('Session status:', session ? 'Active' : 'No session');
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return <LoginScreen />;
}