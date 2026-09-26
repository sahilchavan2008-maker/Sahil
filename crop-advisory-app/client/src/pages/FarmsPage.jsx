import React, { useState, useEffect } from 'react';
import { farmService } from '../services/api';
import { FarmCard } from '../components/FarmCard';
import { Plus, MapPin, X, Loader2, AlertCircle, Layers } from 'lucide-react';

const SOIL_TYPES = [
  'Clay Loam (pH 6.5)',
  'Sandy Loam (pH 6.8)',
  'Silt Loam (pH 7.0)',
  'Deep Alluvial Silt',
  'Black Cotton Clay',
  'Red Laterite Soil',
  'Peaty Organic Soil (pH 5.5)'
];

export const FarmsPage = () => {
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [sizeAcres, setSizeAcres] = useState('');
  const [soilType, setSoilType] = useState(SOIL_TYPES[0]);

  const loadFarms = async () => {
    try {
      setLoading(true);
      const data = await farmService.getAll();
      setFarms(data || []);
    } catch (err) {
      console.error('Failed to load farms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFarms();
  }, []);

  const handleCreateFarm = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const newFarm = await farmService.create({
        name: name.trim(),
        location: location.trim(),
        size_acres: parseFloat(sizeAcres),
        soil_type: soilType
      });

      setFarms([newFarm, ...farms]);
      setIsModalOpen(false);
      setName('');
      setLocation('');
      setSizeAcres('');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create farm');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFarm = async (id) => {
    if (!window.confirm('Are you sure you want to delete this farm plot? Associated advisories will also be removed.')) {
      return;
    }
    try {
      await farmService.delete(id);
      setFarms(farms.filter(f => f.id !== id));
    } catch (err) {
      alert('Failed to delete farm plot: ' + (err.message || 'Unknown error'));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Agricultural Land & Plots</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your land plots, soil profiles, and localized agronomic parameters
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Plot</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        </div>
      ) : farms.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center max-w-lg mx-auto">
          <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Farm Plots Registered Yet</h3>
          <p className="text-xs text-slate-500 mt-1">
            Register your acreage and soil parameters so that Gemini AI can generate accurate, soil-balanced recommendations.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-5 px-5 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl"
          >
            Add Your First Plot
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {farms.map((farm) => (
            <FarmCard key={farm.id} farm={farm} onDelete={handleDeleteFarm} />
          ))}
        </div>
      )}

      {/* New Farm Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Register New Farm Plot</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateFarm} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Farm / Plot Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sunny Ridge Block B"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Geographical Location / Region *
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Salinas Valley, CA / Yakima, WA"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Plot Size (Acres) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  required
                  value={sizeAcres}
                  onChange={(e) => setSizeAcres(e.target.value)}
                  placeholder="e.g. 25.5"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Soil Profile / pH Baseline *
                </label>
                <select
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  {SOIL_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm"
                >
                  {submitting ? 'Saving Plot...' : 'Save Farm Plot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
