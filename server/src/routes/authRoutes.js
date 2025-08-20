import express from 'express';
import { 
  signup, 
  signin, 
  getProfile, 
  refreshToken,
  googleAuth,
  googleCallback,
  getOAuthUser,
  logout
} from '../controllers/authController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/signin', signin);
router.post('/logout', logout);

// Google OAuth routes
router.get('/auth/google', googleAuth);
router.get('/auth/google/callback', googleCallback);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.post('/refresh', authenticateToken, refreshToken);
router.get('/oauth/user', authenticateToken, getOAuthUser);


export default router;
