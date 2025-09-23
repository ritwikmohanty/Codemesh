import express from 'express';
import { 
  getMyPortfolio, 
  getPortfolioByUsername, 
  getPortfolioSummary 
} from '../controllers/portfolioController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

// Protected routes (require authentication)
router.get('/portfolio', authenticateToken, getMyPortfolio);

// Public routes
router.get('/portfolio/:username', getPortfolioByUsername);
router.get('/portfolio/:username/summary', getPortfolioSummary);

export default router;