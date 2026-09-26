import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import {
  createAdvisory,
  getAdvisories,
  getAdvisoryById,
  updateAdvisoryStatus
} from '../controllers/advisoryController.js';

const router = Router();

// Protect all advisory routes with Supabase JWT auth
router.use(requireAuth);

router.post('/', upload.single('image'), createAdvisory);
router.get('/', getAdvisories);
router.get('/:id', getAdvisoryById);
router.patch('/:id/status', updateAdvisoryStatus);

export default router;
