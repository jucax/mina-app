import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://pxndiqjwtippntjivsqq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4bmRpcWp3dGlwcG50aml2c3FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3ODE1MDUsImV4cCI6MjA2NTM1NzUwNX0.aCZ6-yGJAsVyasHPq_KCNrUWmRSMlBkzkhjawq3rJBc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
}); 