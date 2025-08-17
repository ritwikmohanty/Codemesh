import { ContestAggregatorService } from '../services/contestServices/ContestAggregatorService.js';
import Contest from '../models/Contest.js';

const contestService = new ContestAggregatorService();

export const startContestScheduler = async () => {
  console.log('Contest scheduler started');
  

  
  // Run sync immediately on startup
  await syncContests();
  
  // Set up intervals
  // Sync contests every 6 hours
  setInterval(async () => {
    console.log('Running scheduled contest sync...');
    await syncContests();
  }, 6 * 60 * 60 * 1000); // 6 hours
  
  // Update contest statuses every 15 minutes
  setInterval(async () => {
    console.log('Updating contest statuses...');
    await updateStatuses();
  }, 15 * 60 * 1000); // 15 minutes
  
  console.log('Contest scheduler intervals set up successfully');
};

const syncContests = async () => {
  try {
    const result = await contestService.syncContests();
    console.log(`Scheduled contest sync completed: ${result.created} created, ${result.updated} updated`);
  } catch (error) {
    console.error('Scheduled contest sync failed:', error);
  }
};

const updateStatuses = async () => {
  try {
    await contestService.updateContestStatuses();
    console.log('Contest statuses updated successfully');
  } catch (error) {
    console.error('Contest status update failed:', error);
  }
};

