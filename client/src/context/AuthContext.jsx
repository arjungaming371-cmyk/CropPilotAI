import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Demo / Local development mode fallback user
      setUser({
        id: '00000000-0000-0000-0000-000000000000',
        email: 'farmer@croppilot.ai',
        user_metadata: { full_name: 'Demo Farmer' }
      });
      setLoading(false);
      return;
    }

    // Supabase Auth listener
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email, password, fullName) => {
    if (!isSupabaseConfigured) {
      setUser({ id: '00000000-0000-0000-0000-000000000000', email, user_metadata: { full_name: fullName } });
      return { data: { user }, error: null };
    }
    return supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    });
  };

  const signIn = async (email, password) => {
    if (!isSupabaseConfigured) {
      setUser({ id: '00000000-0000-0000-0000-000000000000', email, user_metadata: { full_name: 'Demo Farmer' } });
      return { data: { user }, error: null };
    }
    return supabase.auth.signInWithPassword({ email, password });
  };

  const signOut = async () => {
    if (!isSupabaseConfigured) {
      setUser(null);
      return { error: null };
    }
    return supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut, isSupabaseConfigured }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
