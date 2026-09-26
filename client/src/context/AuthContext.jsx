import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isDemoMode } from '../api/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if demo user is stored
    const storedDemo = localStorage.getItem('fatigue_demo_user');
    if (storedDemo) {
      const parsed = JSON.parse(storedDemo);
      setUser(parsed);
      setSession({ access_token: 'demo-mock-token', user: parsed });
      setLoading(false);
      return;
    }

    if (isDemoMode) {
      setLoading(false);
      return;
    }

    // Check active Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch(err => {
      console.warn('Supabase auth getSession warning:', err);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithEmail = async (email, password) => {
    if (isDemoMode) {
      const demoUser = { id: 'demo-user-123', email };
      localStorage.setItem('fatigue_demo_user', JSON.stringify(demoUser));
      setUser(demoUser);
      setSession({ access_token: 'demo-mock-token', user: demoUser });
      return { user: demoUser };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  };

  const signUpWithEmail = async (email, password) => {
    if (isDemoMode) {
      const demoUser = { id: 'demo-user-123', email };
      localStorage.setItem('fatigue_demo_user', JSON.stringify(demoUser));
      setUser(demoUser);
      setSession({ access_token: 'demo-mock-token', user: demoUser });
      return { user: demoUser };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });
    if (error) throw error;
    return data;
  };

  const signInDemo = () => {
    const demoUser = { id: 'demo-user-123', email: 'tired-cook@antifatigue.app' };
    localStorage.setItem('fatigue_demo_user', JSON.stringify(demoUser));
    setUser(demoUser);
    setSession({ access_token: 'demo-mock-token', user: demoUser });
  };

  const signOut = async () => {
    localStorage.removeItem('fatigue_demo_user');
    setUser(null);
    setSession(null);
    if (!isDemoMode) {
      await supabase.auth.signOut();
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signInWithEmail,
      signUpWithEmail,
      signInDemo,
      signOut,
      isAuthenticated: Boolean(user)
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
