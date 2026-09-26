import { z } from 'zod';

export const mealGenerationSchema = z.object({
  ingredients: z.array(z.string()).min(1, "At least one ingredient or staple is required."),
  timeLimit: z.number().max(45, "Max time must be under 45 minutes for anti-fatigue mode."),
  energyLevel: z.enum(['Low', 'Medium', 'High']),
  dietaryPreference: z.string().optional()
});

export const pantryItemSchema = z.object({
  itemName: z.string().min(1, "Item name is required"),
  category: z.enum(['canned', 'frozen', 'pantry', 'fresh']),
  isLazyBackup: z.boolean().default(false)
});

export const weeklyPlanSchema = z.object({
  weekStartDate: z.string().min(1, "Week start date is required"),
  mealIdeas: z.array(z.string()).length(3, "The Rule of Three requires exactly 3 core dinner ideas."),
  isCompleted: z.boolean().optional().default(false)
});

export const anchorThemeSchema = z.object({
  dayOfWeek: z.enum([
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
  ]),
  themeName: z.string().min(1, "Theme name is required"),
  defaultRecipe: z.string().optional().nullable()
});

export const bulkAnchorThemeSchema = z.object({
  themes: z.array(anchorThemeSchema)
});
