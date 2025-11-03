import express from 'express';
import { 
  getOnboardingStatus, 
  completeOnboarding,
  checkUsernameAvailability
} from '../controllers/onboardingController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

// All onboarding routes require authentication
router.get('/onboarding/status', authenticateToken, getOnboardingStatus);
router.post('/onboarding/complete', authenticateToken, completeOnboarding);
router.get('/onboarding/check-username', authenticateToken, checkUsernameAvailability);

export default router;
