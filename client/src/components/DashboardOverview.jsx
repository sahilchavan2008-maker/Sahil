import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import {
  Calendar,
  CheckCircle2,
  Circle,
  Flame,
  Clock,
  Sparkles,
  ArrowRight,
  Archive,
  Utensils,
  Lightbulb,
  Save,
  CheckSquare
} from 'lucide-react';

export default function DashboardOverview() {
  const navigate = useNavigate();
  const [plannerData, setPlannerData] = useState(null);
  const [pantryItems, setPantryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sunday Checklist 3-idea state
  const [idea1, setIdea1] = useState('');
  const [idea2, setIdea2] = useState('');
  const [idea3, setIdea3] = useState('');
  const [savingPlan, setSavingPlan] = useState(false);
  const [planSavedMsg, setPlanSavedMsg] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [plannerRes, pantryRes] = await Promise.all([
        api.getPlanner(),
        api.getPantryItems()
      ]);

      if (plannerRes.success) {
        setPlannerData(plannerRes.data);
        const currentIdeas = plannerRes.data.currentPlan?.meal_ideas || [];
        setIdea1(currentIdeas[0] || '10-Minute Soy Garlic Veggie Ramen');
        setIdea2(currentIdeas[1] || 'Soft Scrambled Eggs with Toast');
        setIdea3(currentIdeas[2] || 'One-Pot Tomato Chickpea Skillet');
      }

      if (pantryRes.success) {
        setPantryItems(pantryRes.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError(err.message || 'Failed to load dashboard details');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChecklist = async (e) => {
    e.preventDefault();
    if (!idea1.trim() || !idea2.trim() || !idea3.trim()) {
      alert('The Rule of Three requires exactly 3 core dinner ideas to eliminate mid-week fatigue.');
      return;
    }

    setSavingPlan(true);
    try {
      // Calculate current week Monday
      const now = new Date();
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(now.setDate(diff)).toISOString().split('T')[0];

      await api.saveWeeklyPlan({
        weekStartDate: monday,
        mealIdeas: [idea1.trim(), idea2.trim(), idea3.trim()],
        isCompleted: plannerData?.currentPlan?.is_completed || false
      });

      setPlanSavedMsg(true);
      setTimeout(() => setPlanSavedMsg(false), 3000);
      await loadDashboardData();
    } catch (err) {
      alert('Failed to save checklist: ' + err.message);
    } finally {
      setSavingPlan(false);
    }
  };

  const handleTogglePlanCompletion = async () => {
    if (!plannerData?.currentPlan?.id) return;
    try {
      await api.togglePlanCompletion(plannerData.currentPlan.id);
      await loadDashboardData();
    } catch (err) {
      console.error('Failed to toggle completion:', err);
    }
  };

  // Determine today's day of week & match anchor theme
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = daysOfWeek[new Date().getDay()];
  const todayTheme = plannerData?.themes?.find(t => t.day_of_week === todayName) || {
    day_of_week: todayName,
    theme_name: 'Anti-Fatigue Decision Day',
    default_recipe: '15-Minute Lazy Backup Skillet'
  };

  const lazyBackupsCount = pantryItems.filter(i => i.is_lazy_backup).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin mb-4" />
        <p className="text-sm text-slate-400">Loading your anti-fatigue dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner: Decision Fatigue Status */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/60 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold uppercase tracking-wider">
                Anti-Fatigue System Active
              </span>
              <span className="text-xs text-slate-400">|</span>
              <span className="text-xs text-slate-300 font-medium">Today is {todayName}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Bypass Tonight's Decision Paralysis
            </h1>
            <p className="text-slate-400 text-sm max-w-xl mt-1">
              The "Rule of Three" limits weekly dinners to 3 committed ideas + lazy backup pantry staples. No 5 PM panic.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/generator"
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-semibold text-sm shadow-lg shadow-rose-500/20 hover:from-rose-600 hover:to-amber-600 active:scale-[0.98] transition-all flex items-center gap-2"
            >
              <Flame className="w-4 h-4" />
              Panic Mode (AI Meal)
            </Link>
            <Link
              to="/pantry"
              className="px-4 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700 text-slate-300 font-medium text-sm transition-colors flex items-center gap-2"
            >
              <Archive className="w-4 h-4 text-teal-400" />
              Lazy Stash ({lazyBackupsCount})
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* Main Grid: Today's Anchor Decision & Sunday 5-Minute Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Today's Decision Card */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-lg flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-4 border-b border-slate-800 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Today's Pre-Decided Theme
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-medium">
                  {todayName}
                </span>
              </div>

              <div className="mb-4">
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">
                  Routine Anchor
                </span>
                <h3 className="text-2xl font-bold text-white mt-0.5">
                  {todayTheme.theme_name}
                </h3>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 mb-6">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                  <span className="font-semibold text-slate-300 flex items-center gap-1">
                    <Utensils className="w-3.5 h-3.5 text-teal-400" />
                    Default 15-Minute Recipe:
                  </span>
                  <span className="flex items-center gap-1 text-teal-400">
                    <Clock className="w-3 h-3" />
                    &lt; 15 mins
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-200">
                  {todayTheme.default_recipe || 'Quick Pantry Mix & Match Warm Bowl'}
                </p>
              </div>

              <div className="space-y-2 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>No need to debate or search recipe websites.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Uses your recurring pantry staples.</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-slate-800 space-y-3">
              <Link
                to={`/generator?theme=${encodeURIComponent(todayTheme.theme_name)}`}
                className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <Sparkles className="w-4 h-4" />
                Cook This / Adapt with AI
              </Link>

              <Link
                to="/generator"
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-rose-300 hover:text-rose-200 border border-slate-700 font-medium text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                Don't feel like this? Trigger 15-Min Panic Fallback
              </Link>
            </div>
          </div>
        </div>

        {/* Right: Sunday 5-Minute Checklist Widget */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-lg flex-1 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <CheckSquare className="w-3.5 h-3.5" />
                      Sunday 5-Minute Checklist
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      Rule of Three
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1">
                    Lock In 3 Core Dinners for the Week
                  </h3>
                </div>

                {plannerData?.currentPlan && (
                  <button
                    type="button"
                    onClick={handleTogglePlanCompletion}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                      plannerData.currentPlan.is_completed
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {plannerData.currentPlan.is_completed ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Week Completed
                      </>
                    ) : (
                      <>
                        <Circle className="w-3.5 h-3.5" />
                        Mark Week Done
                      </>
                    )}
                  </button>
                )}
              </div>

              <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                Planning 7 different meals causes burnout. The anti-fatigue philosophy: choose just <strong className="text-teal-300 font-semibold">3 core dinners</strong>. The other nights are for leftovers, simple takeout, or your 15-minute lazy backups.
              </p>

              <form onSubmit={handleSaveChecklist} className="space-y-4">
                {/* Dinner Idea 1 */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 focus-within:border-teal-500/60 transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 text-[11px] font-extrabold flex items-center justify-center">
                        1
                      </span>
                      Core Dinner #1
                    </label>
                    <span className="text-[10px] text-slate-500">e.g. Anchor Favorite</span>
                  </div>
                  <input
                    type="text"
                    value={idea1}
                    onChange={(e) => setIdea1(e.target.value)}
                    placeholder="e.g. 10-Minute Soy Garlic Veggie Ramen"
                    className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none"
                    required
                  />
                </div>

                {/* Dinner Idea 2 */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 focus-within:border-teal-500/60 transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-[11px] font-extrabold flex items-center justify-center">
                        2
                      </span>
                      Core Dinner #2
                    </label>
                    <span className="text-[10px] text-slate-500">e.g. High-Comfort / Breakfast</span>
                  </div>
                  <input
                    type="text"
                    value={idea2}
                    onChange={(e) => setIdea2(e.target.value)}
                    placeholder="e.g. Soft Scrambled Eggs with Buttered Sourdough Toast"
                    className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none"
                    required
                  />
                </div>

                {/* Dinner Idea 3 */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 focus-within:border-teal-500/60 transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 text-[11px] font-extrabold flex items-center justify-center">
                        3
                      </span>
                      Core Dinner #3
                    </label>
                    <span className="text-[10px] text-slate-500">e.g. Foolproof One-Pot</span>
                  </div>
                  <input
                    type="text"
                    value={idea3}
                    onChange={(e) => setIdea3(e.target.value)}
                    placeholder="e.g. One-Pot Tomato Chickpea & Spinach Skillet"
                    className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none"
                    required
                  />
                </div>

                {/* Submit action */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                    Locked in for this upcoming week
                  </span>
                  <button
                    type="submit"
                    disabled={savingPlan}
                    className="py-2.5 px-5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {savingPlan ? 'Saving...' : 'Lock In 3 Dinners'}
                  </button>
                </div>
              </form>

              {planSavedMsg && (
                <div className="mt-3 p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Your 3 core dinners are locked! Decision fatigue neutralized.
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <Link to="/planner" className="hover:text-teal-400 transition-colors flex items-center gap-1">
                Customize 7-day anchor themes <ArrowRight className="w-3 h-3" />
              </Link>
              <Link to="/pantry" className="hover:text-teal-400 transition-colors flex items-center gap-1">
                Manage 15-min backup stash <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
