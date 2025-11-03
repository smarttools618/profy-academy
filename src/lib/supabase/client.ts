import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';

// Client-side Supabase client for use in Client Components
export const createClient = () => createClientComponentClient<Database>();

// Export a singleton instance for convenience
export const supabase = createClient();
