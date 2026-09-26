import { generateMealRecommendation } from '../services/geminiService.js';

export async function generateMeal(req, res) {
  try {
    const { ingredients, timeLimit, energyLevel, dietaryPreference } = req.body;

    const startTime = Date.now();
    const recipe = await generateMealRecommendation(
      ingredients,
      timeLimit,
      energyLevel,
      dietaryPreference
    );
    const durationMs = Date.now() - startTime;

    // Rule of Three validation & anti-fatigue checks
    const ruleOfThreeCompliant = {
      isFast: recipe.prepTimeMinutes <= 20,
      isSimple: recipe.ingredientsUsed.length <= 8,
      effortMatch: energyLevel === 'Low' ? recipe.prepTimeMinutes <= 12 : true,
      message: recipe.prepTimeMinutes <= 15
        ? 'Fully aligned with the 15-Minute Lazy Backup Anti-Fatigue Rule.'
        : 'Slightly higher effort, but still streamlined for low cognitive load.'
    };

    return res.json({
      success: true,
      durationMs,
      data: {
        ...recipe,
        ruleOfThreeCompliant
      }
    });
  } catch (err) {
    console.error('[AIController] generateMeal error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to generate meal recommendation'
    });
  }
}
