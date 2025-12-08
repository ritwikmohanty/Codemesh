import express from 'express';
import { 
  syncPlatformData,
  syncAllPlatforms,
  getMyCodeforcesData,
  getMyLeetCodeData,
  getCodeforcesDataByUsername,
  getLeetCodeDataByUsername,
  getCodeChefDataByUsername,
  getPlatformSummary
} from '../controllers/platformController.js';
import { authenticateToken } from '../middlewares/auth.js';
import { syncAllRateLimit } from '../middlewares/rateLimit.js';

const router = express.Router();

// Platform sync endpoints (protected)
router.post('/platform/sync', authenticateToken, syncPlatformData);
router.post('/platform/sync-all', authenticateToken, syncAllRateLimit, syncAllPlatforms);

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