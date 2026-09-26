import { Router } from 'express';
import {
  getPlanner,
  saveWeeklyPlan,
  updateAnchorThemes,
  togglePlanCompletion
} from '../controllers/plannerController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { weeklyPlanSchema, bulkAnchorThemeSchema } from '../schemas/validationSchemas.js';

const router = Router();

router.use(requireAuth);

router.get('/', getPlanner);
router.post('/', validate(weeklyPlanSchema, 'body'), saveWeeklyPlan);
router.put('/themes', validate(bulkAnchorThemeSchema, 'body'), updateAnchorThemes);
router.patch('/complete/:id', togglePlanCompletion);

export default router;
