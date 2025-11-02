import cron from 'node-cron';
import LeaderboardService from '../services/leaderboardService.js';

const leaderboardService = new LeaderboardService();

/**
 * Leaderboard Scheduler
 * Handles periodic recalculation of ratings and leaderboard updates
 */

let isRecalculating = false;

/**
 * Job: Recalculate all user ratings
 * Runs every 6 hours
 */
export const scheduleRatingRecalculation = () => {
  // Run every 6 hours at minute 0
  // Cron format: minute hour day month weekday
  cron.schedule('0 */6 * * *', async () => {
    if (isRecalculating) {
      console.log('Rating recalculation already in progress, skipping...');
      return;
    }
    
    try {
      isRecalculating = true;
      console.log('Starting scheduled rating recalculation...');
      
      const result = await leaderboardService.recalculateAllRatings({
        batchSize: 50,
        onlyActive: true,
        minSubmissions: 1
      });
      
      console.log('Scheduled rating recalculation completed:', result.summary);
      
    } catch (error) {
      console.error('Error in scheduled rating recalculation:', error);
    } finally {
      isRecalculating = false;
    }
  });
  
  console.log('Leaderboard rating recalculation scheduler started (every 6 hours)');
};

/**
 * Job: Update ranks for all users
 * Runs every hour
 */
export const scheduleRankUpdate = () => {
  // Run every hour at minute 5
  cron.schedule('5 * * * *', async () => {
    try {
      console.log('Starting scheduled rank update...');
      
      await leaderboardService.updateAllRanks();
      
      console.log('Scheduled rank update completed');
      
    } catch (error) {
      console.error('Error in scheduled rank update:', error);
    }
  });
  
  console.log('Leaderboard rank update scheduler started (every hour)');
};

/**
 * Job: Calculate rating growth for all users
 * Runs daily at 2 AM
 */
export const scheduleRatingGrowthCalculation = () => {
  // Run daily at 2:00 AM
  cron.schedule('0 2 * * *', async () => {
    try {
      console.log('Starting scheduled rating growth calculation...');
      
      // This is a placeholder - implement actual growth calculation
      // You would need to track historical ratings to calculate growth
      
      console.log('Scheduled rating growth calculation completed');
      
    } catch (error) {
      console.error('Error in scheduled rating growth calculation:', error);
    }
  });
  
  console.log('Rating growth calculation scheduler started (daily at 2 AM)');
};

/**
 * Start all leaderboard schedulers
 */
export const startLeaderboardScheduler = () => {
  console.log('Starting leaderboard schedulers...');
  
  scheduleRatingRecalculation();
  scheduleRankUpdate();
  scheduleRatingGrowthCalculation();
  
  console.log('All leaderboard schedulers started');
};

/**
 * Manual trigger for rating recalculation (for testing or admin use)
 */
export const triggerManualRecalculation = async (options = {}) => {
  if (isRecalculating) {
    console.log('Rating recalculation already in progress');
    return { success: false, message: 'Recalculation already in progress' };
  }
  
  try {
    isRecalculating = true;
    console.log('Manual rating recalculation triggered');
    
    const result = await leaderboardService.recalculateAllRatings(options);
    
    console.log('Manual rating recalculation completed:', result.summary);
    return result;
    
  } catch (error) {
    console.error('Error in manual rating recalculation:', error);
    throw error;
  } finally {
    isRecalculating = false;
  }
};
