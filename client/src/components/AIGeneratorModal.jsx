import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import {
  Flame,
  Clock,
  BatteryLow,
  BatteryMedium,
  BatteryCharging,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  ChefHat,
  HeartHandshake,
  RotateCcw
} from 'lucide-react';

export default function AIGeneratorModal({ isOpen = true, onClose, initialIngredients = [] }) {
  const [pantryStaples, setPantryStaples] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState(
    initialIngredients.length > 0 ? initialIngredients : ['Eggs', 'Canned Chickpeas', 'Tortillas']
  );
  const [customInput, setCustomInput] = useState('');
  const [timeLimit, setTimeLimit] = useState(15);
  const [energyLevel, setEnergyLevel] = useState('Low');
  const [dietaryPreference, setDietaryPreference] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recipeResult, setRecipeResult] = useState(null);

  useEffect(() => {
    // Fetch pantry items to offer quick-select pills
    api.getPantryItems()
      .then(res => {
        if (res.success && res.data) {
          setPantryStaples(res.data);
          // If no initial selected, default to lazy backup items
          if (initialIngredients.length === 0) {
            const backups = res.data.filter(i => i.is_lazy_backup).map(i => i.item_name);
            if (backups.length > 0) {
              setSelectedIngredients(backups.slice(0, 4));
            }
          }
        }
      })
      .catch(err => console.warn('Could not prefill pantry staples:', err));
  }, []);

  const toggleIngredient = (name) => {
    if (selectedIngredients.includes(name)) {
      setSelectedIngredients(selectedIngredients.filter(i => i !== name));
    } else {
      setSelectedIngredients([...selectedIngredients, name]);
    }
  };

  const handleAddCustom = (e) => {
    e.preventDefault();
    const trimmed = customInput.trim();
    if (trimmed && !selectedIngredients.includes(trimmed)) {
      setSelectedIngredients([...selectedIngredients, trimmed]);
      setCustomInput('');
    }
  };

  const removeIngredient = (name) => {
    setSelectedIngredients(selectedIngredients.filter(i => i !== name));
  };

  const handleGenerate = async () => {
    if (selectedIngredients.length === 0) {
      setError('Please pick or enter at least one staple or ingredient.');
      return;
    }

    setLoading(true);
    setError(null);
    setRecipeResult(null);

    try {
      const response = await api.generateMeal({
        ingredients: selectedIngredients,
        timeLimit: Number(timeLimit),
        energyLevel,
        dietaryPreference: dietaryPreference || undefined
      });

      if (response.success && response.data) {
        setRecipeResult(response.data);
      } else {
        throw new Error(response.error || 'Failed to generate recipe');
      }
    } catch (err) {
      setError(err.message || 'AI generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Flame className="w-3.5 h-3.5" />
            Panic Mode: 2-Minute Decision Engine
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Exhausted? Let Gemini Decide Dinner.
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Zero cognitive friction. Tell us what's in your reach and your current battery level.
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form & Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-6">
          {/* Energy Level Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              1. Current Energy Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => { setEnergyLevel('Low'); setTimeLimit(10); }}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
                  energyLevel === 'Low'
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-md shadow-rose-500/10'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <BatteryLow className="w-5 h-5 mb-1 text-rose-400" />
                <span>Low</span>
                <span className="text-[10px] text-slate-500">Dead Tired</span>
              </button>
              <button
                type="button"
                onClick={() => { setEnergyLevel('Medium'); setTimeLimit(15); }}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
                  energyLevel === 'Medium'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <BatteryMedium className="w-5 h-5 mb-1 text-amber-400" />
                <span>Medium</span>
                <span className="text-[10px] text-slate-500">15-min OK</span>
              </button>
              <button
                type="button"
                onClick={() => { setEnergyLevel('High'); setTimeLimit(25); }}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
                  energyLevel === 'High'
                    ? 'bg-teal-500/20 border-teal-500 text-teal-300 shadow-md shadow-teal-500/10'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <BatteryCharging className="w-5 h-5 mb-1 text-teal-400" />
                <span>High</span>
                <span className="text-[10px] text-slate-500">Up to Cook</span>
              </button>
            </div>
          </div>

          {/* Time Limit Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-teal-400" />
                2. Max Cooking Time
              </label>
              <span className="text-sm font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                {timeLimit} minutes
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="45"
              step="5"
              value={timeLimit}
              onChange={(e) => setTimeLimit(Number(e.target.value))}
              className="w-full accent-teal-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500 mt-1">
              <span>5m (Instant)</span>
              <span>15m (Rule of 3 Sweetspot)</span>
              <span>45m (Max)</span>
            </div>
          </div>

          {/* Dietary Preference */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              3. Dietary Filter (Optional)
            </label>
            <select
              value={dietaryPreference}
              onChange={(e) => setDietaryPreference(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-teal-500 transition-colors"
            >
              <option value="">No Restrictions</option>
              <option value="Vegetarian">Vegetarian</option>
              <option value="Vegan">Vegan</option>
              <option value="Gluten-Free">Gluten-Free</option>
              <option value="High-Protein">High-Protein</option>
              <option value="Dairy-Free">Dairy-Free</option>
            </select>
          </div>

          {/* Ingredients Picker */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              4. Ingredients Available ({selectedIngredients.length} picked)
            </label>

            {/* Custom Input */}
            <form onSubmit={handleAddCustom} className="flex gap-2 mb-3">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Add ingredient (e.g. spinach, pasta)..."
                className="flex-1 bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-teal-500"
              />
              <button
                type="submit"
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-teal-400 rounded-xl border border-slate-700 flex items-center gap-1 text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </form>

            {/* Selected Pills */}
            <div className="flex flex-wrap gap-1.5 mb-3 min-h-[38px] p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
              {selectedIngredients.length === 0 ? (
                <span className="text-xs text-slate-500 italic p-1">No ingredients selected yet. Click pills below.</span>
              ) : (
                selectedIngredients.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-medium"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => removeIngredient(item)}
                      className="hover:text-rose-400 transition-colors ml-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Quick Pantry Quick-Picks */}
            {pantryStaples.length > 0 && (
              <div>
                <span className="text-[11px] text-slate-500 uppercase tracking-wide block mb-1.5">
                  Quick-Tap from your Lazy Pantry:
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                  {pantryStaples.map((staple) => {
                    const isPicked = selectedIngredients.includes(staple.item_name);
                    return (
                      <button
                        key={staple.id}
                        type="button"
                        onClick={() => toggleIngredient(staple.item_name)}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                          isPicked
                            ? 'bg-teal-500/20 border-teal-500/50 text-teal-300'
                            : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                        }`}
                      >
                        {staple.is_lazy_backup && '⭐ '}
                        {staple.item_name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-rose-500 via-amber-500 to-teal-500 text-white font-semibold text-base shadow-lg shadow-rose-500/20 hover:opacity-95 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Gemini Cooking Up Solution...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Generate Zero-Friction Meal</span>
              </>
            )}
          </button>
        </div>

        {/* Recipe Output Column */}
        <div className="lg:col-span-7 flex flex-col">
          {recipeResult ? (
            <div className="flex-1 bg-slate-950/80 border border-teal-500/30 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
              {/* Top Meta */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
                      <ChefHat className="w-4 h-4" />
                    </span>
                    <span className="text-xs uppercase font-bold tracking-wider text-teal-400">
                      Instant Solution
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                      <Clock className="w-3.5 h-3.5" />
                      {recipeResult.prepTimeMinutes} mins total
                    </span>
                    {recipeResult.ruleOfThreeCompliant && (
                      <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Rule of 3 Certified
                      </span>
                    )}
                  </div>
                </div>

                {/* Recipe Title */}
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 leading-snug">
                  {recipeResult.title}
                </h3>

                {/* Encouragement note */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 mb-5 flex items-start gap-2.5 text-slate-300 text-xs italic">
                  <HeartHandshake className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <span>"{recipeResult.encouragementNote}"</span>
                </div>

                {/* Ingredients Used */}
                <div className="mb-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Ingredients Used ({recipeResult.ingredientsUsed?.length || 0})
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {recipeResult.ingredientsUsed?.map((ing, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-slate-800/90 border border-slate-700 text-slate-200 text-xs font-medium"
                      >
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Steps */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Stress-Free Steps (1-2-3 Execution)
                  </h4>
                  <ol className="space-y-2.5">
                    {recipeResult.steps?.map((step, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-sm text-slate-200"
                      >
                        <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 border border-teal-500/30 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              {/* Bottom Re-roll bar */}
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {recipeResult.ruleOfThreeCompliant?.message || 'Simple, under 20 minutes, 0 headache.'}
                </span>
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="flex items-center gap-1.5 text-xs text-teal-400 hover:text-teal-300 font-semibold"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Try Another Variation
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 min-h-[360px] rounded-2xl border-2 border-dashed border-slate-800/80 bg-slate-950/40 p-8 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700 flex items-center justify-center text-slate-500 mb-4">
                <ChefHat className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-300 mb-1">
                Your Instant Recipe Will Appear Here
              </h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Hit "Generate Zero-Friction Meal" and the Google Gemini AI will return a strict anti-fatigue meal plan under your time limit.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
