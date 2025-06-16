import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://tliwzfdnpeozlanhpxmn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsaXd6ZmRucGVvemxhbmhweG1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MzY2MzksImV4cCI6MjA2NTUxMjYzOX0.1EY13lSb0UjsqNoqGJEK7Hgh4SBJ9LxBr3Llt89am44';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
}); 