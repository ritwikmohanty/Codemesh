#!/usr/bin/env node

/**
 * Script to fix existing leaderboard data
 * Run with: node scripts/fixLeaderboardData.js
 */

import '../src/config/env.js';
import mongoose from 'mongoose';
import LeaderboardEntry from '../src/models/LeaderboardEntry.js';
import PlatformData from '../src/models/PlatformData.js';
import LeaderboardService from '../src/services/leaderboardService.js';

const leaderboardService = new LeaderboardService();

async function fixLeaderboardData() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Get all leaderboard entries
    const entries = await LeaderboardEntry.find().populate('user');
    console.log(`Found ${entries.length} leaderboard entries`);

    let fixed = 0;
    let failed = 0;

    for (const entry of entries) {
      try {
        console.log(`\nProcessing user: ${entry.user?.username || entry.user?._id}`);
        
        // Recalculate rating for this user
        const result = await leaderboardService.calculateAndUpdateUserRating(entry.user._id);
        
        if (result.success) {
          console.log(`✓ Updated: Master Rating = ${result.masterRating}, Tier = ${result.tier}`);
          fixed++;
        } else {
          console.log(`✗ Failed to update`);
          failed++;
        }
      } catch (error) {
        console.error(`✗ Error processing user ${entry.user?._id}:`, error.message);
        failed++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('Migration Complete!');
    console.log('='.repeat(50));
    console.log(`✓ Successfully fixed: ${fixed}`);
    console.log(`✗ Failed: ${failed}`);
    console.log(`Total processed: ${entries.length}`);
    
    // Update ranks for all users
    console.log('\nUpdating ranks...');
    await leaderboardService.updateAllRanks();
    console.log('✓ Ranks updated');

    process.exit(0);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Run the migration
fixLeaderboardData();
