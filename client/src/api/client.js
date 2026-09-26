import { supabase, isDemoMode } from './supabase';

const API_BASE = '/api';

async function getAuthHeader() {
  if (isDemoMode) {
    return { Authorization: 'Bearer demo-mock-token' };
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    return { Authorization: `Bearer ${session.access_token}` };
  }

  // Fallback to demo token if user logged in via demo mode
  const localDemo = localStorage.getItem('fatigue_demo_user');
  if (localDemo) {
    return { Authorization: 'Bearer demo-mock-token' };
  }

  return {};
}

async function request(endpoint, options = {}) {
  const authHeader = await getAuthHeader();
  const headers = {
    'Content-Type': 'application/json',
    ...authHeader,
    ...options.headers
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMsg = data.error || (data.details && data.details[0]?.message) || 'Request failed';
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  // Pantry
  getPantryItems: () => request('/pantry'),
  addPantryItem: (item) => request('/pantry', { method: 'POST', body: JSON.stringify(item) }),
  deletePantryItem: (id) => request(`/pantry/${id}`, { method: 'DELETE' }),
  toggleLazyBackup: (id) => request(`/pantry/${id}/toggle-backup`, { method: 'PATCH' }),

  // Planner
  getPlanner: () => request('/planner'),
  saveWeeklyPlan: (plan) => request('/planner', { method: 'POST', body: JSON.stringify(plan) }),
  updateThemes: (themes) => request('/planner/themes', { method: 'PUT', body: JSON.stringify({ themes }) }),
  togglePlanCompletion: (id) => request(`/planner/complete/${id}`, { method: 'PATCH' }),

  // AI Generator
  generateMeal: (payload) => request('/ai/generate-meal', { method: 'POST', body: JSON.stringify(payload) })
};
