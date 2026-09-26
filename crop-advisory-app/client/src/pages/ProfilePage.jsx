import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { systemService } from '../services/api';
import { User, Mail, Shield, CheckCircle2, Server, Key, LogOut } from 'lucide-react';

export const ProfilePage = () => {
  const { user, logout } = useAuth();
  const [health, setHealth] = useState(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const data = await systemService.getHealth();
        setHealth(data);
      } catch (err) {
        console.error('Failed to get system health:', err);
      }
    };
    fetchHealth();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Farmer Profile & Configuration</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your account credentials, role authorization, and backend service telemetry
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Details */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-emerald-500/20">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{user?.full_name || 'Agronomist User'}</h2>
              <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 mt-1">
                {user?.role || 'Farmer'} Role
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100 text-sm">
            <div className="flex items-center gap-3 text-slate-600">
              <Mail className="w-4 h-4 text-slate-400" />
              <span>{user?.email}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <Shield className="w-4 h-4 text-slate-400" />
              <span>Row-Level Security (RLS) Active Isolation</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={logout}
              className="w-full py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-rose-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of Account</span>
            </button>
          </div>
        </div>

        {/* System & AI Telemetry */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5">
            <Server className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900">AI Engine & Cloud Telemetry</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-100">
              <span className="text-slate-500 font-medium">Backend Status</span>
              <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {health?.status || 'Active'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-100">
              <span className="text-slate-500 font-medium">Gemini AI Model</span>
              <span className="font-bold text-slate-800">
                {health?.activeModel || 'gemini-2.5-flash'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-100">
              <span className="text-slate-500 font-medium">SDK Initialized</span>
              <span className="font-bold text-emerald-700">
                {health?.geminiInitialized ? 'Yes (@google/genai)' : 'Ready / Simulated'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-100">
              <span className="text-slate-500 font-medium">PostgreSQL Storage</span>
              <span className="font-bold text-slate-800">
                {health?.supabaseConnected ? 'Supabase Connected' : 'Local In-Memory Mode'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
