import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Get environment variables with fallback
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a singleton Supabase client
let supabaseInstance: ReturnType<typeof createSupabaseClient<Database>> | null = null;

function getSupabaseClient() {
  // Only create client in browser environment
  if (typeof window === 'undefined') {
    return null;
  }

  // Return existing instance if already created
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // Validate environment variables
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase environment variables are not set!');
    return null;
  }

  // Create new instance
  supabaseInstance = createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'profy-academy-auth',
    },
  });

  return supabaseInstance;
}

// Export the client instance (not a function)
export const supabase = getSupabaseClient();

// Also export function for manual initialization
export const createClient = getSupabaseClient;
