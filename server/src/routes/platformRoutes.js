import express from 'express';
import { 
  syncPlatformData,
  getMyCodeforcesData,
  getMyLeetCodeData,
  getCodeforcesDataByUsername,
  getLeetCodeDataByUsername,
  getCodeChefDataByUsername,
  getPlatformSummary
} from '../controllers/platformController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

// Platform sync endpoint (protected)
router.post('/platform/sync', authenticateToken, syncPlatformData);

// Authenticated user's platform data
router.get('/platform/codeforces', authenticateToken, getMyCodeforcesData);
router.get('/platform/leetcode', authenticateToken, getMyLeetCodeData);

// Public platform-specific endpoints
router.get('/platform/:username/codeforces', getCodeforcesDataByUsername);
router.get('/platform/:username/leetcode', getLeetCodeDataByUsername);
router.get('/platform/:username/codechef', getCodeChefDataByUsername);

// Platform summary endpoints
router.get('/platform/:username/:platform/summary', getPlatformSummary);

export default router;