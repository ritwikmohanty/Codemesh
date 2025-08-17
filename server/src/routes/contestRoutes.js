import express from 'express';
import { ContestAggregatorService } from '../services/contestServices/ContestAggregatorService.js';

const router = express.Router();
const contestService = new ContestAggregatorService();

// Get all contests with optional filters
router.get('/contests', async (req, res) => {
  try {
    const { platform, status, difficulty, limit } = req.query;
    
    const filters = {
      platform,
      status,
      difficulty,
      limit: limit ? parseInt(limit) : 100
    };

    const contests = await contestService.getContests(filters);
    
    res.json({
      success: true,
      data: contests,
      count: contests.length
    });
  } catch (error) {
    console.error('Error fetching contests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contests',
      error: error.message
    });
  }
});

// Manually trigger contest sync
router.post('/contests/sync', async (req, res) => {
  try {
    const result = await contestService.syncContests();
    
    res.json({
      success: true,
      message: `Successfully synced contests: ${result.created} created, ${result.updated} updated`,
      data: {
        total: result.total,
        created: result.created,
        updated: result.updated
      }
    });
  } catch (error) {
    console.error('Error syncing contests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync contests',
      error: error.message
    });
  }
});

// Update contest statuses
router.post('/contests/update-statuses', async (req, res) => {
  try {
    await contestService.updateContestStatuses();
    
    res.json({
      success: true,
      message: 'Contest statuses updated successfully'
    });
  } catch (error) {
    console.error('Error updating contest statuses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update contest statuses',
      error: error.message
    });
  }
});

// Get contest statistics
router.get('/contests/stats', async (req, res) => {
  try {
    const stats = await contestService.getContestStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching contest stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contest stats',
      error: error.message
    });
  }
});

export default router;
