import { Router } from 'express';
import { generateMeal } from '../controllers/aiController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { mealGenerationSchema } from '../schemas/validationSchemas.js';

const router = Router();

router.use(requireAuth);

router.post('/generate-meal', validate(mealGenerationSchema, 'body'), generateMeal);

export default router;
