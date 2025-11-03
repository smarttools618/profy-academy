import { createClient as createClientComponentClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// This is a client-side only version of the Supabase client
let supabase: ReturnType<typeof createClientComponentClient<Database>> | null = null;

// Create and return a Supabase client for client-side usage
export const createClient = () => {
  // Only create the client once and reuse it
  if (!supabase && typeof window !== 'undefined') {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables!');
      return null;
    }
    
    supabase = createClientComponentClient<Database>({
      supabaseUrl,
      supabaseKey,
      options: {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      }
    });
  }
  
  return supabase;
};

// Export a singleton instance for convenience
export const getSupabase = () => createClient();

// For backward compatibility
export { getSupabase as supabase };
