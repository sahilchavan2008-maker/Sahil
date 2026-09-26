import { ai, hasGeminiKey } from '../config/gemini.js';

const SYSTEM_PROMPT = `You are a compassionate, pragmatic home-cooking assistant designed to eliminate cognitive overload for tired adults after a long workday. Never suggest recipes with more than 8 ingredients or requiring more than 20 minutes unless explicitly requested. Keep instructions clear, direct, and stress-free.`;

/**
 * Intelligent fallback generator when GEMINI_API_KEY is not configured or fails
 */
function generateFallbackMeal(ingredients, timeLimit, energyLevel, dietaryPreference) {
  const primary = ingredients[0] || 'Eggs';
  const secondary = ingredients[1] || 'Bread';
  const tertiary = ingredients[2] || 'Cheese';

  let title = `Quick ${primary} & ${secondary} Pan Skillet`;
  let steps = [
    `Heat a non-stick skillet over medium heat with a drop of oil or butter.`,
    `Toss in ${ingredients.slice(0, 3).join(', ')} and heat gently for 3-5 minutes.`,
    `Season simply with salt, pepper, or your favorite staple spice blend.`,
    `Plate immediately and relax—dinner is done.`
  ];
  let prepTimeMinutes = Math.min(timeLimit || 15, 12);

  if (energyLevel === 'Low') {
    title = `Zero-Effort 5-Minute ${primary} Warm Plate`;
    prepTimeMinutes = Math.min(timeLimit || 10, 8);
    steps = [
      `Grab a microwave-safe plate or small pan.`,
      `Combine ${ingredients.slice(0, 2).join(' and ')} with a pinch of salt.`,
      `Warm thoroughly for 90 seconds (or 3 minutes on the stove).`,
      `Sit down and eat straight away—you made it through the day!`
    ];
  }

  return {
    title,
    prepTimeMinutes,
    ingredientsUsed: ingredients.slice(0, 5),
    steps,
    encouragementNote: `You had a long day and your energy is ${energyLevel}. You chose to nourish yourself with zero fuss. Enjoy this peaceful meal!`
  };
}

export async function generateMealRecommendation(ingredients, timeLimit, energyLevel, dietaryPreference = '') {
  if (!hasGeminiKey || !ai) {
    return generateFallbackMeal(ingredients, timeLimit, energyLevel, dietaryPreference);
  }

  const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  const userPrompt = `You are an anti-decision fatigue culinary assistant. The user is exhausted, has an energy level of "${energyLevel}", a time limit of ${timeLimit} minutes, dietary preference: "${dietaryPreference || 'None'}", and these available ingredients: ${ingredients.join(', ')}. Provide a fast, foolproof meal solution.`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            title: { type: 'STRING' },
            prepTimeMinutes: { type: 'NUMBER' },
            ingredientsUsed: { type: 'ARRAY', items: { type: 'STRING' } },
            steps: { type: 'ARRAY', items: { type: 'STRING' } },
            encouragementNote: { type: 'STRING' }
          },
          required: ['title', 'prepTimeMinutes', 'ingredientsUsed', 'steps', 'encouragementNote']
        }
      }
    });

    const parsed = JSON.parse(response.text);
    return parsed;
  } catch (err) {
    console.warn(`[Gemini API] Primary generation error (${err.message}). Falling back to anti-fatigue rule-based meal generator.`);
    return generateFallbackMeal(ingredients, timeLimit, energyLevel, dietaryPreference);
  }
}
