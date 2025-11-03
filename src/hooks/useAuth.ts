'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  email: string;
  full_name_ar: string;
  role: 'student' | 'parent' | 'teacher' | 'admin';
  grade_level?: 'grade_5' | 'grade_6' | 'grade_7';
  avatar_url?: string;
}

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if Supabase client is available
    if (!supabase) {
      console.error('Supabase client not available');
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      if (!supabase) {
        console.error('Supabase client not available');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data as Profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    if (!supabase) {
      console.error('Supabase client not available');
      return;
    }
    await supabase.auth.signOut();
    router.push('/login');
  };

  return {
    user,
    profile,
    loading,
    signOut,
    isAuthenticated: !!user,
    isStudent: profile?.role === 'student',
    isParent: profile?.role === 'parent',
    isTeacher: profile?.role === 'teacher',
    isAdmin: profile?.role === 'admin',
  };
}
