import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  analyzeSymptoms,
  getAdvisories,
  getAdvisoryById,
  updateAdvisoryStatus
} from '../controllers/advisoryController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Rate limiter for AI analysis to protect quota (30 requests per 15 minutes per IP)
const aiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    success: false,
    error: 'Too many diagnostic requests submitted. Please wait a few moments before requesting another AI advisory.'
  }
});

router.use(requireAuth);

router.post('/analyze', aiRateLimiter, analyzeSymptoms);
router.get('/', getAdvisories);
router.get('/:id', getAdvisoryById);
router.patch('/:id/status', updateAdvisoryStatus);

export default router;
