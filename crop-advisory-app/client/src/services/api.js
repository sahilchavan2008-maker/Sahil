import axios from 'axios';
import { supabase, isSupabaseConfigured } from './supabase';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 45000 // 45 seconds for AI multimodal processing
});

// Interceptor to attach Supabase JWT or demo token
api.interceptors.request.use(async (config) => {
  let token = localStorage.getItem('agri_demo_token');

  if (isSupabaseConfigured && supabase) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      token = session.access_token;
    }
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

export const farmService = {
  getAll: async () => {
    const res = await api.get('/farms');
    return res.data.farms;
  },
  getById: async (id) => {
    const res = await api.get(`/farms/${id}`);
    return res.data.farm;
  },
  create: async (data) => {
    const res = await api.post('/farms', data);
    return res.data.farm;
  },
  delete: async (id) => {
    const res = await api.delete(`/farms/${id}`);
    return res.data;
  }
};

export const advisoryService = {
  getAll: async (params = {}) => {
    const res = await api.get('/advisories', { params });
    return res.data.advisories;
  },
  getById: async (id) => {
    const res = await api.get(`/advisories/${id}`);
    return res.data.advisory;
  },
  create: async (formData) => {
    const res = await api.post('/advisories', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data.advisory;
  },
  updateStatus: async (id, status) => {
    const res = await api.patch(`/advisories/${id}/status`, { status });
    return res.data.advisory;
  }
};

export const systemService = {
  getHealth: async () => {
    const res = await api.get('/health');
    return res.data;
  }
};

export default api;
