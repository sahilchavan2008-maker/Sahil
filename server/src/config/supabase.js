import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://mock-antifatigue-project.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'mock-anon-key';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'mock-service-key';

export const isMockSupabase = !process.env.SUPABASE_URL ||
  process.env.SUPABASE_URL.includes('mock-antifatigue-project') ||
  process.env.SUPABASE_URL.includes('your-supabase-project');

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// In-memory demo store used if live Supabase is not yet configured by the user
export const mockDataStore = {
  users: [
    {
      id: 'demo-user-123',
      email: 'demo@antifatigue.app'
    }
  ],
  pantryItems: [
    {
      id: 'pantry-1',
      user_id: 'demo-user-123',
      item_name: 'Chickpeas (Canned)',
      category: 'canned',
      is_lazy_backup: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'pantry-2',
      user_id: 'demo-user-123',
      item_name: 'Frozen Peas & Carrots',
      category: 'frozen',
      is_lazy_backup: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'pantry-3',
      user_id: 'demo-user-123',
      item_name: 'Quick Rolled Oats',
      category: 'pantry',
      is_lazy_backup: false,
      created_at: new Date().toISOString()
    },
    {
      id: 'pantry-4',
      user_id: 'demo-user-123',
      item_name: 'Eggs (Half Dozen)',
      category: 'fresh',
      is_lazy_backup: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'pantry-5',
      user_id: 'demo-user-123',
      item_name: 'Marinara Sauce (Jar)',
      category: 'pantry',
      is_lazy_backup: true,
      created_at: new Date().toISOString()
    }
  ],
  anchorThemes: [
    {
      id: 'theme-1',
      user_id: 'demo-user-123',
      day_of_week: 'Monday',
      theme_name: 'Quick Stir-Fry Monday',
      default_recipe: '10-Minute Soy Garlic Veggie Ramen Bowl'
    },
    {
      id: 'theme-2',
      user_id: 'demo-user-123',
      day_of_week: 'Tuesday',
      theme_name: 'Taco / Wrap Tuesday',
      default_recipe: 'Black Bean & Melted Cheese Tortilla Fold'
    },
    {
      id: 'theme-3',
      user_id: 'demo-user-123',
      day_of_week: 'Wednesday',
      theme_name: 'Breakfast for Dinner Wednesday',
      default_recipe: 'Soft Scrambled Eggs with Toast & Sautéed Greens'
    },
    {
      id: 'theme-4',
      user_id: 'demo-user-123',
      day_of_week: 'Thursday',
      theme_name: 'One-Pot Pasta Thursday',
      default_recipe: '12-Minute Tomato Basil Garlic Rotini'
    },
    {
      id: 'theme-5',
      user_id: 'demo-user-123',
      day_of_week: 'Friday',
      theme_name: 'Takeout / Easy Pizza Friday',
      default_recipe: 'Crispy Pita Bread Margherita Pizzas'
    },
    {
      id: 'theme-6',
      user_id: 'demo-user-123',
      day_of_week: 'Saturday',
      theme_name: 'Slow & Comfort Saturday',
      default_recipe: 'Hearty Lentil Soup or Sheet Pan Roast'
    },
    {
      id: 'theme-7',
      user_id: 'demo-user-123',
      day_of_week: 'Sunday',
      theme_name: 'Lazy Backup Stash Sunday',
      default_recipe: 'Canned Chickpea Mediterranean Warm Salad'
    }
  ],
  weeklyPlans: [
    {
      id: 'plan-1',
      user_id: 'demo-user-123',
      week_start_date: new Date().toISOString().split('T')[0],
      meal_ideas: [
        '10-Minute Soy Garlic Veggie Ramen Bowl',
        'Soft Scrambled Eggs with Buttered Toast',
        'One-Pot Tomato Chickpea Skillet'
      ],
      is_completed: false,
      created_at: new Date().toISOString()
    }
  ]
};
