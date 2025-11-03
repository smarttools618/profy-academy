import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';

// Server-side Supabase client for use in Server Components and Route Handlers
export const createClient = () =>
  createServerComponentClient<Database>({ cookies });
