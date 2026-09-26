import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import {
  Archive,
  Star,
  Plus,
  Trash2,
  CheckCircle2,
  PackageCheck,
  Snowflake,
  Box,
  Apple,
  Filter
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All Items', icon: Archive },
  { id: 'canned', label: 'Canned Goods', icon: Box },
  { id: 'frozen', label: 'Frozen Staples', icon: Snowflake },
  { id: 'pantry', label: 'Dry Pantry', icon: PackageCheck },
  { id: 'fresh', label: 'Fresh Essentials', icon: Apple }
];

export default function PantryManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('all');
  const [showOnlyBackup, setShowOnlyBackup] = useState(false);
  const [error, setError] = useState(null);

  // New item form state
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('canned');
  const [isLazyBackup, setIsLazyBackup] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPantry();
  }, []);

  const loadPantry = async () => {
    setLoading(true);
    try {
      const res = await api.getPantryItems();
      if (res.success && res.data) {
        setItems(res.data);
      }
    } catch (err) {
      console.error('Failed to load pantry:', err);
      setError(err.message || 'Failed to load pantry inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!itemName.trim()) {
      setError('Please provide an item name');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await api.addPantryItem({
        itemName: itemName.trim(),
        category,
        isLazyBackup
      });

      if (res.success && res.data) {
        setItems([res.data, ...items]);
        setItemName('');
        setIsLazyBackup(true);
      }
    } catch (err) {
      setError(err.message || 'Failed to add item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      await api.deletePantryItem(id);
      setItems(items.filter(i => i.id !== id));
    } catch (err) {
      alert('Failed to delete item: ' + err.message);
    }
  };

  const handleToggleBackup = async (id) => {
    try {
      const res = await api.toggleLazyBackup(id);
      if (res.success && res.data) {
        setItems(items.map(i => (i.id === id ? res.data : i)));
      }
    } catch (err) {
      alert('Failed to toggle backup status: ' + err.message);
    }
  };

  // Filter items
  const filteredItems = items.filter(item => {
    if (showOnlyBackup && !item.is_lazy_backup) return false;
    if (filterCategory !== 'all' && item.category !== filterCategory) return false;
    return true;
  });

  const totalBackupCount = items.filter(i => i.is_lazy_backup).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin mb-4" />
        <p className="text-sm text-slate-400">Loading your pantry inventory...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <Archive className="w-3.5 h-3.5" />
              15-Minute Safety Net
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              "Lazy Backup" Pantry Tracker
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Stock foolproof staples (canned beans, frozen peas, dry pasta, eggs) so you always have a zero-effort meal on standby without ordering takeout.
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Star className="w-6 h-6 fill-amber-400/20" />
            </div>
            <div>
              <span className="text-2xl font-extrabold text-white">{totalBackupCount}</span>
              <span className="text-xs text-slate-400 block font-medium">Lazy Backup Staples Ready</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Add New Item & Filters Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Add New Item Form */}
        <div className="lg:col-span-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg sticky top-24">
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <Plus className="w-4 h-4 text-teal-400" />
              Add Pantry Staple
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Keep your inventory updated for the Gemini instant meal engine.
            </p>

            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Item Name
                </label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g. Canned Black Beans, Frozen Dumplings"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-teal-500"
                >
                  <option value="canned">Canned Goods</option>
                  <option value="frozen">Frozen Staples</option>
                  <option value="pantry">Dry Pantry</option>
                  <option value="fresh">Fresh Essentials</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-200 block flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30" />
                    Designate as "Lazy Backup"
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Use for 15-minute emergency fallback meals
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isLazyBackup}
                  onChange={(e) => setIsLazyBackup(e.target.checked)}
                  className="w-5 h-5 accent-teal-500 rounded cursor-pointer"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                {submitting ? 'Adding...' : 'Add to Inventory'}
              </button>
            </form>
          </div>
        </div>

        {/* Right: Inventory Grid with Filtering */}
        <div className="lg:col-span-8 space-y-5">
          {/* Filter Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-md">
            <div className="flex flex-wrap items-center gap-1.5">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = filterCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFilterCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-transparent'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {cat.label}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setShowOnlyBackup(!showOnlyBackup)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                showOnlyBackup
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 border-slate-800 hover:bg-slate-800/60'
              }`}
            >
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
              Lazy Backups Only
            </button>
          </div>

          {/* Items Grid */}
          {filteredItems.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border-2 border-dashed border-slate-800 bg-slate-900/40">
              <Archive className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h4 className="text-base font-semibold text-slate-300">No pantry items match</h4>
              <p className="text-xs text-slate-500 mt-1">
                Add staples using the form or switch the active category filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    item.is_lazy_backup
                      ? 'bg-slate-900 border-amber-500/30 shadow-md shadow-amber-500/5'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 rounded uppercase font-bold tracking-wider bg-slate-800 text-slate-400 border border-slate-700 text-[10px]">
                        {item.category}
                      </span>
                      {item.is_lazy_backup && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 fill-amber-300" />
                          Lazy Backup
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-semibold text-slate-100 truncate">
                      {item.item_name}
                    </h4>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleToggleBackup(item.id)}
                      title={item.is_lazy_backup ? 'Unmark lazy backup' : 'Mark as lazy backup'}
                      className={`p-2 rounded-lg transition-colors ${
                        item.is_lazy_backup
                          ? 'text-amber-400 hover:bg-amber-500/10'
                          : 'text-slate-500 hover:text-amber-400 hover:bg-slate-800'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${item.is_lazy_backup ? 'fill-amber-400' : ''}`} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item.id)}
                      title="Delete item"
                      className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
