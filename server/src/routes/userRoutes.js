import express from 'express';
import { 
  searchUsers, 
  getUserByUsername,
  updateProfile,
  updateSocials,
  changePassword,
  getLinkedPlatforms
} from '../controllers/userController.js';
import { optionalAuth, authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

// Protected routes (require authentication) - must come before parameterized routes
router.get('/users/platforms', authenticateToken, getLinkedPlatforms);
router.put('/users/profile', authenticateToken, updateProfile);
router.put('/users/socials', authenticateToken, updateSocials);
router.put('/users/password', authenticateToken, changePassword);

// Public routes (with optional auth for personalization)
router.get('/users/search', optionalAuth, searchUsers);
router.get('/users/:username', getUserByUsername);

export default router;
