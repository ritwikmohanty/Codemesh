import express from 'express';
import { signup, signin, getProfile, refreshToken } from '../controllers/authController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/signin', signin);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.post('/refresh', authenticateToken, refreshToken);

// All route paths are valid. If you add new routes, ensure no stray ':' or malformed parameters.

export default router;
