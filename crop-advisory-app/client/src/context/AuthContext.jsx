import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      // 1. Check for active Supabase session
      if (isSupabaseConfigured && supabase) {
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        if (existingSession) {
          setSession(existingSession);
          setUser({
            id: existingSession.user.id,
            email: existingSession.user.email,
            full_name: existingSession.user.user_metadata?.full_name || existingSession.user.email.split('@')[0],
            role: existingSession.user.user_metadata?.role || 'farmer'
          });
          setLoading(false);
          return;
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
          setSession(currentSession);
          if (currentSession?.user) {
            setUser({
              id: currentSession.user.id,
              email: currentSession.user.email,
              full_name: currentSession.user.user_metadata?.full_name || currentSession.user.email.split('@')[0],
              role: currentSession.user.user_metadata?.role || 'farmer'
            });
          } else {
            setUser(null);
          }
        });

        setLoading(false);
        return () => subscription.unsubscribe();
      }

      // 2. Local Demo fallback check
      const demoToken = localStorage.getItem('agri_demo_token');
      const savedDemoUser = localStorage.getItem('agri_demo_user');
      if (demoToken && savedDemoUser) {
        try {
          setUser(JSON.parse(savedDemoUser));
        } catch {
          localStorage.removeItem('agri_demo_token');
          localStorage.removeItem('agri_demo_user');
        }
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      setSession(data.session);
      setUser({
        id: data.user.id,
        email: data.user.email,
        full_name: data.user.user_metadata?.full_name || data.user.email.split('@')[0],
        role: data.user.user_metadata?.role || 'farmer'
      });
      return data;
    }

    // Demo Mode Login
    return loginAsDemo(email);
  };

  const signup = async (email, password, fullName = '') => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: 'farmer'
          }
        }
      });
      if (error) throw error;
      return data;
    }

    // Demo Mode Signup
    return loginAsDemo(email, fullName);
  };

  const loginAsDemo = (email = 'farmer@greenfields.org', fullName = 'Dr. Sarah Jenkins') => {
    const demoUser = {
      id: 'demo-user-id',
      email,
      full_name: fullName,
      role: 'farmer'
    };
    localStorage.setItem('agri_demo_token', 'demo-token');
    localStorage.setItem('agri_demo_user', JSON.stringify(demoUser));
    setUser(demoUser);
    return demoUser;
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('agri_demo_token');
    localStorage.removeItem('agri_demo_user');
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        login,
        signup,
        loginAsDemo,
        logout,
        isAuthenticated: Boolean(user)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
