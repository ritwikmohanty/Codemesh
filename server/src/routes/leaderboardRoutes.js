import express from 'express';
import {
  getGlobalLeaderboard,
  getTopUsers,
  getMyLeaderboardEntry,
  getLeaderboardEntryByUsername,
  getLeaderboardStats,
  getLeaderboardByTier,
  recalculateMyRating,
  recalculateAllRatings,
  getLeaderboardContext,
  searchLeaderboard
} from '../controllers/leaderboardController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

/**
 * Leaderboard Routes
 * Base path: /api/v1/leaderboard
 */

// Public routes

/**
 * @route   GET /api/v1/leaderboard
 * @desc    Get global leaderboard with pagination and filters
 * @access  Public
 * @query   page (number), limit (number), tier (string), search (string)
 */
router.get('/leaderboard', getGlobalLeaderboard);

/**
 * @route   GET /api/v1/leaderboard/top/:count
 * @desc    Get top N users from leaderboard
 * @access  Public
 * @params  count (number, max 100)
 */
router.get('/leaderboard/top/:count', getTopUsers);

/**
 * @route   GET /api/v1/leaderboard/stats
 * @desc    Get leaderboard statistics
 * @access  Public
 */
router.get('/leaderboard/stats', getLeaderboardStats);

/**
 * @route   GET /api/v1/leaderboard/tier/:tier
 * @desc    Get leaderboard filtered by tier
 * @access  Public
 * @params  tier (string)
 * @query   page (number), limit (number)
 */
router.get('/leaderboard/tier/:tier', getLeaderboardByTier);

/**
 * @route   GET /api/v1/leaderboard/user/:username
 * @desc    Get leaderboard entry by username
 * @access  Public
 * @params  username (string)
 */
router.get('/leaderboard/user/:username', getLeaderboardEntryByUsername);

/**
 * @route   GET /api/v1/leaderboard/context/:rank
 * @desc    Get users around a specific rank
 * @access  Public
 * @params  rank (number)
 * @query   range (number, default 5)
 */
router.get('/leaderboard/context/:rank', getLeaderboardContext);

/**
 * @route   GET /api/v1/leaderboard/search
 * @desc    Search users in leaderboard
 * @access  Public
 * @query   q (string), page (number), limit (number)
 */
router.get('/leaderboard/search', searchLeaderboard);

// Protected routes (require authentication)

/**
 * @route   GET /api/v1/leaderboard/me
 * @desc    Get authenticated user's leaderboard entry
 * @access  Private
 */
router.get('/leaderboard/me', authenticateToken, getMyLeaderboardEntry);

/**
 * @route   POST /api/v1/leaderboard/recalculate
 * @desc    Recalculate rating for authenticated user
 * @access  Private
 */
router.post('/leaderboard/recalculate', authenticateToken, recalculateMyRating);

// Admin routes (should add admin middleware in production)

/**
 * @route   POST /api/v1/leaderboard/admin/recalculate-all
 * @desc    Recalculate ratings for all users (Admin only)
 * @access  Private (Admin)
 * @body    batchSize (number), onlyActive (boolean), minSubmissions (number)
 */
router.post('/leaderboard/admin/recalculate-all', authenticateToken, recalculateAllRatings);

export default router;
