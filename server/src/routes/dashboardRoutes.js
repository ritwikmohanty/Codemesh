import express from 'express';
import { 
  getDashboardByUsername, 
  getMyDashboard, 
  getDashboardSummary 
} from '../controllers/dashboardController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Protected routes (require authentication)
router.get('/dashboard/me', authenticateToken, getMyDashboard);

// Public routes
router.get('/dashboard/:username', getDashboardByUsername);
router.get('/dashboard/:username/summary', getDashboardSummary);

export default router;
