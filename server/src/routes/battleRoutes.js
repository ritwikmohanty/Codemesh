import express from 'express';
import { authenticateToken } from '../middlewares/auth.js';
import {
  createBattle,
  joinBattle,
  getUserBattles,
  getBattle,
  getBattleParticipants,
  getBattleProblems,
  getBattleStandings,
  getBattleSubmissions,
  refreshSubmissions,
  startBattle,
  endBattle,
  cancelBattle,
  getServerTime
} from '../controllers/battleController.js';

const router = express.Router();

/**
 * Battle Routes
 * All routes require authentication except server time
 */

// Get server time (public - for client sync)
router.get('/battles/time', getServerTime);

// Create a new battle
router.post('/battles', authenticateToken, createBattle);

// Join a battle using join token
router.post('/battles/join/:joinToken', authenticateToken, joinBattle);

// Get all battles for the current user
router.get('/battles', authenticateToken, getUserBattles);

// Get a specific battle
router.get('/battles/:id', authenticateToken, getBattle);

// Get battle participants
router.get('/battles/:id/participants', authenticateToken, getBattleParticipants);

// Get battle problems (only after battle starts)
router.get('/battles/:id/problems', authenticateToken, getBattleProblems);

// Get battle standings
router.get('/battles/:id/standings', authenticateToken, getBattleStandings);

// Get battle submissions
router.get('/battles/:id/submissions', authenticateToken, getBattleSubmissions);

// Refresh submissions (poll Codeforces API)
router.post('/battles/:id/refresh', authenticateToken, refreshSubmissions);

// Start a battle (creator only)
router.post('/battles/:id/start', authenticateToken, startBattle);

// End a battle (creator only)
router.post('/battles/:id/end', authenticateToken, endBattle);

// Cancel a battle (creator only)
router.delete('/battles/:id', authenticateToken, cancelBattle);

export default router;
