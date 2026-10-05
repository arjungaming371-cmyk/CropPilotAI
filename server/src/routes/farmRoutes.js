import express from 'express';
import { getFarms, createFarm, createField, createCrop } from '../controllers/farmController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', getFarms);
router.post('/', createFarm);
router.post('/fields', createField);
router.post('/crops', createCrop);

export default router;
