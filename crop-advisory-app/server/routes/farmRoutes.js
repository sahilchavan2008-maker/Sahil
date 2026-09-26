import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getFarms, getFarmById, createFarm, deleteFarm } from '../controllers/farmController.js';

const router = Router();

// Protect all farm routes
router.use(requireAuth);

router.get('/', getFarms);
router.post('/', createFarm);
router.get('/:id', getFarmById);
router.delete('/:id', deleteFarm);

export default router;
