import express from 'express';
import { syncPlatformData, getProfile, getPublicProfile } from '../controllers/profileController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

// Protected routes (require authentication)
router.post('/profile/sync', authenticateToken, syncPlatformData);
router.get('/profile', authenticateToken, getProfile);

// Public routes
router.get('/profile/:username', getPublicProfile);

export default router;
