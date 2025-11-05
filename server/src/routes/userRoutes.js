import express from 'express';
import { searchUsers, getUserByUsername } from '../controllers/userController.js';
import { optionalAuth } from '../middlewares/auth.js';

const router = express.Router();

// Public routes (with optional auth for personalization)
router.get('/users/search', optionalAuth, searchUsers);
router.get('/users/:username', getUserByUsername);

export default router;
