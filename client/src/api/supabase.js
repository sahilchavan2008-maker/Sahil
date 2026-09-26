import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mock-antifatigue-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'mock-anon-key';

export const isDemoMode = !import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.VITE_SUPABASE_URL.includes('mock-antifatigue-project') ||
  import.meta.env.VITE_SUPABASE_URL.includes('your-supabase-project');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
