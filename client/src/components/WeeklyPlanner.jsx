import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import {
  CalendarDays,
  Sparkles,
  Save,
  CheckCircle2,
  Clock,
  Info,
  Flame,
  Utensils
} from 'lucide-react';

const DAYS_ORDER = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

const PRESET_CATEGORIES = [
  { name: 'Quick Stir-Fry', effort: 'Level 1 (<10m)', badge: 'bg-emerald-500/20 text-emerald-300' },
  { name: 'Comfort & Pasta', effort: 'Level 2 (15-20m)', badge: 'bg-amber-500/20 text-amber-300' },
  { name: 'Breakfast for Dinner', effort: 'Level 1 (<10m)', badge: 'bg-teal-500/20 text-teal-300' },
  { name: 'Takeout / Easy Pizza', effort: 'Level 1 (0-10m)', badge: 'bg-indigo-500/20 text-indigo-300' },
  { name: 'Lazy Backup Stash', effort: 'Level 1 (<15m)', badge: 'bg-rose-500/20 text-rose-300' }
];

export default function WeeklyPlanner() {
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPlanner();
  }, []);

  const loadPlanner = async () => {
    setLoading(true);
    try {
      const res = await api.getPlanner();
      if (res.success && res.data.themes) {
        // Sort according to standard Monday-Sunday
        const sorted = [...res.data.themes].sort(
          (a, b) => DAYS_ORDER.indexOf(a.day_of_week) - DAYS_ORDER.indexOf(b.day_of_week)
        );
        setThemes(sorted);
      }
    } catch (err) {
      console.error('Failed to load planner themes:', err);
      setError(err.message || 'Failed to load anchor themes');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (dayOfWeek, field, value) => {
    setThemes(prev =>
      prev.map(t => (t.day_of_week === dayOfWeek ? { ...t, [field]: value } : t))
    );
  };

  const handleApplyPreset = (dayOfWeek, presetName, defaultRecipe) => {
    setThemes(prev =>
      prev.map(t =>
        t.day_of_week === dayOfWeek
          ? { ...t, theme_name: `${presetName} ${dayOfWeek}`, default_recipe: defaultRecipe }
          : t
      )
    );
  };

  const handleSaveThemes = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = themes.map(t => ({
        dayOfWeek: t.day_of_week,
        themeName: t.theme_name,
        defaultRecipe: t.default_recipe || ''
      }));

      await api.updateThemes(payload);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save anchor themes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin mb-4" />
        <p className="text-sm text-slate-400">Loading your anchor themes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header & Concept Explainer */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <CalendarDays className="w-3.5 h-3.5" />
              Weekly Anchor Theme Architecture
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Pre-Assign Repeating Weekly Themes
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              By assigning repeating thematic categories to each day of the week, your brain never has to ask "What should we eat tonight?" from scratch.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSaveThemes}
            disabled={saving}
            className="px-6 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving Themes...' : 'Save Weekly Schedule'}
          </button>
        </div>

        {savedSuccess && (
          <div className="mt-4 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            Weekly anchor schedule saved! Changes immediately reflect on your daily dashboard.
          </div>
        )}

        {error && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Target Domains Legend */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center gap-3 text-xs text-slate-400">
        <span className="font-semibold text-slate-300 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-teal-400" />
          Standard Anti-Fatigue Anchor Categories:
        </span>
        {PRESET_CATEGORIES.map((cat, i) => (
          <span key={i} className={`px-2.5 py-1 rounded-lg font-medium border border-slate-700/60 ${cat.badge}`}>
            {cat.name} ({cat.effort})
          </span>
        ))}
      </div>

      {/* 7 Days Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {themes.map((theme) => {
          const isWeekend = theme.day_of_week === 'Saturday' || theme.day_of_week === 'Sunday';
          return (
            <div
              key={theme.day_of_week}
              className={`bg-slate-900 border rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all hover:border-slate-700 ${
                isWeekend ? 'border-amber-500/30 bg-slate-900/90' : 'border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-800">
                  <span className="text-base font-extrabold text-white">
                    {theme.day_of_week}
                  </span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    isWeekend ? 'bg-amber-500/20 text-amber-300' : 'bg-teal-500/20 text-teal-300'
                  }`}>
                    {isWeekend ? 'Relax / Backup' : 'Weekday Routine'}
                  </span>
                </div>

                {/* Theme Name Input */}
                <div className="mb-3">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Theme Name
                  </label>
                  <input
                    type="text"
                    value={theme.theme_name}
                    onChange={(e) => handleFieldChange(theme.day_of_week, 'theme_name', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-teal-500 font-medium"
                    placeholder="e.g. Quick Stir-Fry Monday"
                  />
                </div>

                {/* Default 15-Min Recipe */}
                <div className="mb-4">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center justify-between">
                    <span>Default 15-Min Recipe</span>
                    <span className="text-teal-400 text-[10px] flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" /> &lt;15m
                    </span>
                  </label>
                  <textarea
                    rows={2}
                    value={theme.default_recipe || ''}
                    onChange={(e) => handleFieldChange(theme.day_of_week, 'default_recipe', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500 resize-none"
                    placeholder="e.g. 10-Minute Soy Garlic Veggie Ramen"
                  />
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="pt-3 border-t border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-1.5">
                  Quick Reset Theme:
                </span>
                <div className="flex flex-wrap gap-1">
                  <button
                    type="button"
                    onClick={() => handleApplyPreset(theme.day_of_week, 'Quick Stir-Fry', '10-Minute Soy Garlic Veggie Ramen')}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    Stir-Fry
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset(theme.day_of_week, 'Breakfast for Dinner', 'Soft Scrambled Eggs on Buttered Toast')}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    Breakfast
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset(theme.day_of_week, 'One-Pot Pasta', '12-Minute Tomato Basil Garlic Rotini')}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    Pasta
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset(theme.day_of_week, 'Lazy Backup Stash', 'Canned Chickpea Mediterranean Warm Salad')}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    Lazy Stash
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
