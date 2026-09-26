import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { farmService, advisoryService } from '../services/api';
import { FarmCard } from '../components/FarmCard';
import { 
  Sprout, 
  PlusCircle, 
  MapPin, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowRight, 
  Activity, 
  Calendar,
  Sparkles,
  Loader2
} from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [farms, setFarms] = useState([]);
  const [advisories, setAdvisories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [farmsData, advisoriesData] = await Promise.all([
          farmService.getAll(),
          advisoryService.getAll()
        ]);
        setFarms(farmsData || []);
        setAdvisories(advisoriesData || []);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalAcreage = farms.reduce((sum, f) => sum + (Number(f.size_acres) || 0), 0);
  const criticalCount = advisories.filter(a => (a.urgency || a.diagnosis_json?.urgency) === 'critical').length;
  const recentAdvisories = advisories.slice(0, 5);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <span className="text-sm font-semibold text-slate-600">Loading agronomic intelligence...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Farm Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome back, {user?.full_name || 'Agronomist'}
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            {farms.length} active farm plots monitored across {totalAcreage.toFixed(1)} acres. {criticalCount > 0 ? `${criticalCount} urgent biological threats require attention.` : 'All crop plots currently within stable health thresholds.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/advisory/new"
            className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Diagnosis</span>
          </Link>
          <Link
            to="/farms"
            className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-all"
          >
            Manage Plots
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Registered Plots</span>
            <span className="text-2xl font-black text-slate-900">{farms.length}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Acreage</span>
            <span className="text-2xl font-black text-slate-900">{totalAcreage.toFixed(1)} ac</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Advisories</span>
            <span className="text-2xl font-black text-slate-900">{advisories.length}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Critical Threats</span>
            <span className="text-2xl font-black text-rose-600">{criticalCount}</span>
          </div>
        </div>
      </div>

      {/* Farms Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Your Agricultural Plots</h2>
            <p className="text-xs text-slate-500">Monitor soil profiles and run plot-specific crop assessments</p>
          </div>
          <Link
            to="/farms"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>View All Plots ({farms.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {farms.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center">
            <MapPin className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800">No Farm Plots Registered</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Register your first agricultural land with soil and geography data to get tailored AI diagnoses.
            </p>
            <Link
              to="/farms"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Register First Plot</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {farms.slice(0, 3).map((farm) => (
              <FarmCard key={farm.id} farm={farm} />
            ))}
          </div>
        )}
      </div>

      {/* Recent Advisories Table */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent AI Crop Advisories</h2>
            <p className="text-xs text-slate-500">Chronological history of plant diagnoses and prescribed protocols</p>
          </div>
          <Link
            to="/analytics"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>Analytics & Trends</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentAdvisories.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center">
            <Sprout className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800">No Crop Advisories Yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Run your first multimodal diagnosis with foliage photos and symptom notes.
            </p>
            <Link
              to="/advisory/new"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New Advisory</span>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-4 sm:px-6">Crop & Stage</th>
                    <th className="py-3.5 px-4">Primary Diagnosis</th>
                    <th className="py-3.5 px-4">Urgency</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {recentAdvisories.map((adv) => {
                    const diagnosis = adv.diagnosis_json || {};
                    const urgency = (diagnosis.urgency || adv.urgency || 'low').toLowerCase();
                    return (
                      <tr key={adv.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-4 sm:px-6 font-semibold text-slate-900">
                          <div>{adv.crop_type}</div>
                          <span className="text-xs text-slate-400 font-normal">{adv.growth_stage}</span>
                        </td>
                        <td className="py-4 px-4 font-medium text-slate-800">
                          {diagnosis.primaryDiagnosis || 'Diagnostic Case'}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                            urgency === 'critical' ? 'bg-rose-100 text-rose-800' :
                            urgency === 'high' ? 'bg-orange-100 text-orange-800' :
                            urgency === 'moderate' ? 'bg-amber-100 text-amber-800' :
                            'bg-emerald-100 text-emerald-800'
                          }`}>
                            {urgency}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-semibold capitalize bg-slate-100 text-slate-700">
                            {adv.status || 'open'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-xs text-slate-400 whitespace-nowrap">
                          {new Date(adv.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4 sm:px-6 text-right">
                          <Link
                            to={`/advisory/${adv.id}`}
                            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
                          >
                            <span>View Report</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
