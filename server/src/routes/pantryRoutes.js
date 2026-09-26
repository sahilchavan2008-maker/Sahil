import { Router } from 'express';
import {
  getPantryItems,
  addPantryItem,
  deletePantryItem,
  toggleLazyBackup
} from '../controllers/pantryController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { pantryItemSchema } from '../schemas/validationSchemas.js';

const router = Router();

router.use(requireAuth);

router.get('/', getPantryItems);
router.post('/', validate(pantryItemSchema, 'body'), addPantryItem);
router.delete('/:id', deletePantryItem);
router.patch('/:id/toggle-backup', toggleLazyBackup);

export default router;
