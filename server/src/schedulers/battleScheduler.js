import cron from 'node-cron';
import BattleService from '../services/battle/BattleService.js';
import Battle from '../models/Battle.js';

const battleService = new BattleService();

/**
 * Battle Scheduler
 * Handles automatic battle starting, submission polling, and battle ending
 */

let isProcessingStarts = false;
let isProcessingPolls = false;
let isProcessingEnds = false;

/**
 * Job: Check and start pending battles
 * Runs every 30 seconds
 */
export const scheduleAutoStartBattles = () => {
  // Run every 30 seconds
  cron.schedule('*/30 * * * * *', async () => {
    if (isProcessingStarts) {
      return;
    }

    try {
      isProcessingStarts = true;

      const pendingBattles = await battleService.getPendingBattlesToStart();

      for (const battle of pendingBattles) {
        await battleService.autoStartBattle(battle);
      }

    } catch (error) {
      console.error('Error in auto-start battles job:', error);
    } finally {
      isProcessingStarts = false;
    }
  });

  console.log('Battle auto-start scheduler started (every 30 seconds)');
};

/**
 * Job: Poll submissions for all in-progress battles
 * Runs every 1 minute
 */
export const scheduleSubmissionPolling = () => {
  // Run every minute
  cron.schedule('* * * * *', async () => {
    if (isProcessingPolls) {
      return;
    }

    try {
      isProcessingPolls = true;

      const inProgressBattles = await Battle.find({ status: 'in_progress' });

      for (const battle of inProgressBattles) {
        try {
          await battleService.pollSubmissions(battle);
        } catch (error) {
          console.error(`Error polling submissions for battle ${battle._id}:`, error.message);
        }
      }

    } catch (error) {
      console.error('Error in submission polling job:', error);
    } finally {
      isProcessingPolls = false;
    }
  });

  console.log('Battle submission polling scheduler started (every minute)');
};

/**
 * Job: Check and end battles that have exceeded their duration
 * Runs every 30 seconds
 */
export const scheduleAutoEndBattles = () => {
  // Run every 30 seconds
  cron.schedule('*/30 * * * * *', async () => {
    if (isProcessingEnds) {
      return;
    }

    try {
      isProcessingEnds = true;

      const battlesToEnd = await battleService.getInProgressBattlesToEnd();

      for (const battle of battlesToEnd) {
        await battleService.autoEndBattle(battle);
      }

    } catch (error) {
      console.error('Error in auto-end battles job:', error);
    } finally {
      isProcessingEnds = false;
    }
  });

  console.log('Battle auto-end scheduler started (every 30 seconds)');
};

/**
 * Job: Clean up old cancelled/completed battles data
 * Runs daily at 3 AM
 */
export const scheduleCleanup = () => {
  // Run daily at 3:00 AM
  cron.schedule('0 3 * * *', async () => {
    try {
      console.log('Starting battle data cleanup...');

      // Delete battles older than 30 days that are completed or cancelled
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await Battle.deleteMany({
        status: { $in: ['completed', 'cancelled'] },
        createdAt: { $lt: thirtyDaysAgo }
      });

      console.log(`Cleaned up ${result.deletedCount} old battles`);

    } catch (error) {
      console.error('Error in battle cleanup job:', error);
    }
  });

  console.log('Battle cleanup scheduler started (daily at 3 AM)');
};

/**
 * Start all battle schedulers
 */
export const startBattleScheduler = () => {
  console.log('Starting battle schedulers...');

  scheduleAutoStartBattles();
  scheduleSubmissionPolling();
  scheduleAutoEndBattles();
  scheduleCleanup();

  console.log('All battle schedulers started successfully');
};

export default {
  startBattleScheduler,
  scheduleAutoStartBattles,
  scheduleSubmissionPolling,
  scheduleAutoEndBattles,
  scheduleCleanup
};
