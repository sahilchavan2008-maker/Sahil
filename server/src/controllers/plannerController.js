import { supabase, isMockSupabase, mockDataStore } from '../config/supabase.js';
import { randomUUID } from 'crypto';

const DEFAULT_DAYS = [
  { day: 'Monday', theme: 'Quick Stir-Fry Monday', recipe: '10-Minute Soy Garlic Veggie Ramen' },
  { day: 'Tuesday', theme: 'Taco / Wrap Tuesday', recipe: 'Black Bean & Melted Cheese Warm Tortilla' },
  { day: 'Wednesday', theme: 'Breakfast for Dinner Wednesday', recipe: 'Soft Scrambled Eggs on Toasted Sourdough' },
  { day: 'Thursday', theme: 'One-Pot Pasta Thursday', recipe: '12-Minute Tomato Basil Garlic Rotini' },
  { day: 'Friday', theme: 'Takeout / Easy Pizza Friday', recipe: 'Crispy Pita Pocket Margherita Pizzas' },
  { day: 'Saturday', theme: 'Slow & Comfort Saturday', recipe: 'Hearty Lentil Soup or Sheet Pan Veggie Bake' },
  { day: 'Sunday', theme: 'Lazy Backup Stash Sunday', recipe: 'Canned Chickpea Mediterranean Warm Salad' }
];

export async function getPlanner(req, res) {
  try {
    const userId = req.user.id;

    if (isMockSupabase) {
      let themes = mockDataStore.anchorThemes.filter(t => t.user_id === userId);
      if (themes.length === 0) {
        themes = DEFAULT_DAYS.map(d => ({
          id: randomUUID(),
          user_id: userId,
          day_of_week: d.day,
          theme_name: d.theme,
          default_recipe: d.recipe
        }));
        mockDataStore.anchorThemes.push(...themes);
      }

      const plans = mockDataStore.weeklyPlans
        .filter(p => p.user_id === userId)
        .sort((a, b) => new Date(b.week_start_date) - new Date(a.week_start_date));

      return res.json({
        success: true,
        data: {
          themes,
          currentPlan: plans[0] || null,
          recentPlans: plans.slice(0, 5)
        }
      });
    }

    // Query anchor themes from Supabase
    let { data: themes, error: themeErr } = await supabase
      .from('anchor_themes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (themeErr) throw themeErr;

    // Seed default themes if user has none
    if (!themes || themes.length === 0) {
      const seedData = DEFAULT_DAYS.map(d => ({
        user_id: userId,
        day_of_week: d.day,
        theme_name: d.theme,
        default_recipe: d.recipe
      }));

      const { data: inserted, error: seedErr } = await supabase
        .from('anchor_themes')
        .insert(seedData)
        .select();

      if (!seedErr && inserted) {
        themes = inserted;
      }
    }

    // Query current/latest weekly plan
    const { data: plans, error: planErr } = await supabase
      .from('weekly_plans')
      .select('*')
      .eq('user_id', userId)
      .order('week_start_date', { ascending: false })
      .limit(5);

    if (planErr) throw planErr;

    return res.json({
      success: true,
      data: {
        themes: themes || [],
        currentPlan: plans?.[0] || null,
        recentPlans: plans || []
      }
    });
  } catch (err) {
    console.error('[PlannerController] getPlanner error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to fetch planner' });
  }
}

export async function saveWeeklyPlan(req, res) {
  try {
    const userId = req.user.id;
    const { weekStartDate, mealIdeas, isCompleted } = req.body;

    if (isMockSupabase) {
      const existingIdx = mockDataStore.weeklyPlans.findIndex(
        p => p.user_id === userId && p.week_start_date === weekStartDate
      );

      const planRecord = {
        id: existingIdx >= 0 ? mockDataStore.weeklyPlans[existingIdx].id : randomUUID(),
        user_id: userId,
        week_start_date: weekStartDate,
        meal_ideas: mealIdeas,
        is_completed: Boolean(isCompleted),
        created_at: new Date().toISOString()
      };

      if (existingIdx >= 0) {
        mockDataStore.weeklyPlans[existingIdx] = planRecord;
      } else {
        mockDataStore.weeklyPlans.unshift(planRecord);
      }

      return res.status(201).json({ success: true, data: planRecord });
    }

    // Upsert plan for user and week_start_date
    const { data, error } = await supabase
      .from('weekly_plans')
      .upsert(
        {
          user_id: userId,
          week_start_date: weekStartDate,
          meal_ideas: mealIdeas,
          is_completed: Boolean(isCompleted)
        },
        { onConflict: 'user_id,week_start_date' }
      )
      .select()
      .single();

    if (error) {
      // If no unique constraint on user_id,week_start_date, fallback to insert
      const { data: inserted, error: insertErr } = await supabase
        .from('weekly_plans')
        .insert({
          user_id: userId,
          week_start_date: weekStartDate,
          meal_ideas: mealIdeas,
          is_completed: Boolean(isCompleted)
        })
        .select()
        .single();

      if (insertErr) throw insertErr;
      return res.status(201).json({ success: true, data: inserted });
    }

    return res.status(201).json({ success: true, data });
  } catch (err) {
    console.error('[PlannerController] saveWeeklyPlan error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to save weekly plan' });
  }
}

export async function updateAnchorThemes(req, res) {
  try {
    const userId = req.user.id;
    const { themes } = req.body; // Array of { dayOfWeek, themeName, defaultRecipe }

    if (isMockSupabase) {
      for (const t of themes) {
        const idx = mockDataStore.anchorThemes.findIndex(
          at => at.user_id === userId && at.day_of_week === t.dayOfWeek
        );
        if (idx >= 0) {
          mockDataStore.anchorThemes[idx].theme_name = t.themeName;
          mockDataStore.anchorThemes[idx].default_recipe = t.defaultRecipe;
        } else {
          mockDataStore.anchorThemes.push({
            id: randomUUID(),
            user_id: userId,
            day_of_week: t.dayOfWeek,
            theme_name: t.themeName,
            default_recipe: t.defaultRecipe
          });
        }
      }
      return res.json({ success: true, message: 'Themes updated successfully' });
    }

    for (const t of themes) {
      const { error } = await supabase
        .from('anchor_themes')
        .upsert({
          user_id: userId,
          day_of_week: t.dayOfWeek,
          theme_name: t.themeName,
          default_recipe: t.defaultRecipe
        });

      if (error) throw error;
    }

    return res.json({ success: true, message: 'Themes updated successfully' });
  } catch (err) {
    console.error('[PlannerController] updateAnchorThemes error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to update themes' });
  }
}

export async function togglePlanCompletion(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (isMockSupabase) {
      const plan = mockDataStore.weeklyPlans.find(p => p.id === id && p.user_id === userId);
      if (!plan) return res.status(404).json({ success: false, error: 'Plan not found' });
      plan.is_completed = !plan.is_completed;
      return res.json({ success: true, data: plan });
    }

    const { data: existing, error: fetchErr } = await supabase
      .from('weekly_plans')
      .select('is_completed')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchErr || !existing) {
      return res.status(404).json({ success: false, error: 'Plan not found' });
    }

    const { data, error } = await supabase
      .from('weekly_plans')
      .update({ is_completed: !existing.is_completed })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    return res.json({ success: true, data });
  } catch (err) {
    console.error('[PlannerController] togglePlanCompletion error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to toggle plan status' });
  }
}
