import LeaderboardEntry from '../models/LeaderboardEntry.js';
import PlatformData from '../models/PlatformData.js';
import PlatformSubmission from '../models/PlatformSubmission.js';
import PlatformRatingHistory from '../models/PlatformRatingHistory.js';
import User from '../models/User.js';
import {
  calculateCodeMeshMasterRating,
  extractPlatformRatings,
  countTotalContests,
  calculateGlobalAcceptanceRate,
  countTotalUniqueSolved
} from '../utils/analyticsCalculator.js';

/**
 * Leaderboard Service
 * Handles calculation and updating of CodeMesh Master Ratings and leaderboard entries
 */
class LeaderboardService {
  
  /**
   * Calculate and update master rating for a specific user
   * @param {string} userId - MongoDB user ID
   * @returns {Promise<Object>} Updated leaderboard entry with rating details
   */
  async calculateAndUpdateUserRating(userId) {
    try {
      // Fetch all required data in parallel
      const [platformData, submissions, ratingHistory] = await Promise.all([
        PlatformData.find({ user: userId, isActive: true }).lean(),
        PlatformSubmission.find({ user: userId }).lean(),
        PlatformRatingHistory.find({ user: userId }).lean()
      ]);
      
      // Extract components for rating calculation
      const platformRatings = extractPlatformRatings(platformData);
      const totalContests = countTotalContests(ratingHistory);
      const acceptanceRate = calculateGlobalAcceptanceRate(submissions);
      const totalSolved = countTotalUniqueSolved(submissions);
      
      // Calculate CodeMesh Master Rating
      const ratingResult = calculateCodeMeshMasterRating({
        platformRatings,
        totalContests,
        acceptanceRate,
        totalSolved
      });
      
      // Find latest submission timestamp
      const lastProblemSolvedAt = this.getLastSubmissionDate(submissions);
      
      // Update or create leaderboard entry
      const leaderboardEntry = await LeaderboardEntry.findOneAndUpdate(
        { user: userId },
        {
          $set: {
            masterRating: ratingResult.masterRating,
            ratingBreakdown: ratingResult.breakdown,
            ratingComponents: ratingResult.components,
            lastProblemSolvedAt,
            lastRatingUpdate: new Date()
          },
          $max: {
            'performanceMetrics.peakRating': ratingResult.masterRating
          }
        },
        { 
          upsert: true, 
          new: true,
          setDefaultsOnInsert: true
        }
      );
      
      // Update peak rating date if this is a new peak
      if (ratingResult.masterRating >= leaderboardEntry.performanceMetrics.peakRating) {
        leaderboardEntry.performanceMetrics.peakRatingDate = new Date();
      }
      
      // Update tier based on rating
      leaderboardEntry.updateTier();
      await leaderboardEntry.save();
      
      console.log(`Updated rating for user ${userId}: ${ratingResult.masterRating}`);
      
      return {
        success: true,
        userId,
        masterRating: ratingResult.masterRating,
        breakdown: ratingResult.breakdown,
        components: ratingResult.components,
        tier: leaderboardEntry.tier
      };
      
    } catch (error) {
      console.error(`Error calculating rating for user ${userId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get last submission date from submissions array
   * @param {Array} submissions - Array of submissions
   * @returns {Date|null} Last submission date or null
   */
  getLastSubmissionDate(submissions) {
    if (!submissions || submissions.length === 0) {
      return null;
    }
    
    const dates = submissions
      .map(sub => sub.quickAccess?.timestamp)
      .filter(date => date)
      .sort((a, b) => new Date(b) - new Date(a));
    
    return dates.length > 0 ? dates[0] : null;
  }
  
  /**
   * Recalculate ratings for all users
   * @param {Object} options - Options for batch calculation
   * @returns {Promise<Object>} Summary of updates
   */
  async recalculateAllRatings(options = {}) {
    const { 
      batchSize = 50,
      onlyActive = true,
      minSubmissions = 0 
    } = options;
    
    try {
      console.log('Starting batch rating recalculation...');
      
      // Get all users with platform data
      const query = onlyActive ? { isActive: true } : {};
      const usersWithData = await PlatformData.distinct('user', query);
      
      console.log(`Found ${usersWithData.length} users to process`);
      
      let processed = 0;
      let successful = 0;
      let failed = 0;
      const errors = [];
      
      // Process in batches to avoid memory issues
      for (let i = 0; i < usersWithData.length; i += batchSize) {
        const batch = usersWithData.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (userId) => {
          try {
            // Check minimum submissions if specified
            if (minSubmissions > 0) {
              const submissionCount = await PlatformSubmission.countDocuments({ user: userId });
              if (submissionCount < minSubmissions) {
                return { success: false, reason: 'insufficient_submissions' };
              }
            }
            
            await this.calculateAndUpdateUserRating(userId);
            return { success: true };
          } catch (error) {
            return { success: false, error: error.message, userId };
          }
        });
        
        const results = await Promise.allSettled(batchPromises);
        
        results.forEach((result, idx) => {
          processed++;
          if (result.status === 'fulfilled' && result.value.success) {
            successful++;
          } else {
            failed++;
            if (result.value?.error) {
              errors.push({
                userId: batch[idx],
                error: result.value.error
              });
            }
          }
        });
        
        console.log(`Processed batch ${Math.floor(i / batchSize) + 1}: ${processed}/${usersWithData.length}`);
      }
      
      // Update ranks after all ratings are calculated
      await this.updateAllRanks();
      
      console.log('Batch rating recalculation completed');
      
      return {
        success: true,
        summary: {
          total: usersWithData.length,
          processed,
          successful,
          failed,
          errors: errors.slice(0, 10) // Return first 10 errors
        }
      };
      
    } catch (error) {
      console.error('Error in batch rating recalculation:', error);
      throw error;
    }
  }
  
  /**
   * Update ranks for all leaderboard entries
   * @returns {Promise<void>}
   */
  async updateAllRanks() {
    try {
      console.log('Updating ranks for all users...');
      
      // Get all entries sorted by master rating
      const entries = await LeaderboardEntry.find({})
        .sort({ masterRating: -1 })
        .select('_id currentRank masterRating')
        .lean();
      
      // Update ranks in batches
      const updatePromises = entries.map((entry, index) => {
        const newRank = index + 1;
        return LeaderboardEntry.findByIdAndUpdate(
          entry._id,
          {
            previousRank: entry.currentRank,
            currentRank: newRank,
            rankChange: entry.currentRank ? entry.currentRank - newRank : 0
          }
        );
      });
      
      await Promise.all(updatePromises);
      
      console.log(`Updated ranks for ${entries.length} users`);
    } catch (error) {
      console.error('Error updating ranks:', error);
      throw error;
    }
  }
  
  /**
   * Get leaderboard with pagination and filtering
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Leaderboard data with pagination
   */
  async getLeaderboard(options = {}) {
    const {
      page = 1,
      limit = 50,
      tier = null,
      search = null,
      sortBy = 'masterRating',
      sortOrder = 'desc'
    } = options;
    
    try {
      const query = {};
      
      // Filter by tier if specified
      if (tier) {
        query.tier = tier;
      }
      
      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
      
      const skip = (page - 1) * limit;
      
      // Get leaderboard entries with user information
      let leaderboardQuery = LeaderboardEntry.find(query)
        .populate('user', 'username name avatarUrl college location')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean();
      
      // If search is provided, we need to filter by username
      if (search) {
        const users = await User.find({
          $or: [
            { username: { $regex: search, $options: 'i' } },
            { name: { $regex: search, $options: 'i' } }
          ]
        }).select('_id').lean();
        
        const userIds = users.map(u => u._id);
        query.user = { $in: userIds };
      }
      
      const [entries, total] = await Promise.all([
        leaderboardQuery,
        LeaderboardEntry.countDocuments(query)
      ]);
      
      return {
        success: true,
        data: entries,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalEntries: total,
          entriesPerPage: limit
        }
      };
      
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      throw error;
    }
  }
  
  /**
   * Get user's leaderboard entry with rank
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User's leaderboard entry
   */
  async getUserLeaderboardEntry(userId) {
    try {
      const entry = await LeaderboardEntry.findOne({ user: userId })
        .populate('user', 'username name avatarUrl college location')
        .lean();
      
      if (!entry) {
        return {
          success: false,
          message: 'User not found in leaderboard'
        };
      }
      
      return {
        success: true,
        data: entry
      };
      
    } catch (error) {
      console.error('Error fetching user leaderboard entry:', error);
      throw error;
    }
  }
  
  /**
   * Get leaderboard statistics
   * @returns {Promise<Object>} Leaderboard statistics
   */
  async getLeaderboardStats() {
    try {
      const [
        totalUsers,
        tierDistribution,
        averageRating,
        topRating
      ] = await Promise.all([
        LeaderboardEntry.countDocuments({}),
        LeaderboardEntry.aggregate([
          { $group: { _id: '$tier', count: { $sum: 1 } } }
        ]),
        LeaderboardEntry.aggregate([
          { $group: { _id: null, avgRating: { $avg: '$masterRating' } } }
        ]),
        LeaderboardEntry.findOne({}).sort({ masterRating: -1 }).select('masterRating').lean()
      ]);
      
      return {
        success: true,
        stats: {
          totalUsers,
          tierDistribution: tierDistribution.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
          averageRating: averageRating[0]?.avgRating || 0,
          topRating: topRating?.masterRating || 0
        }
      };
      
    } catch (error) {
      console.error('Error fetching leaderboard stats:', error);
      throw error;
    }
  }
  
  /**
   * Calculate rating growth for a user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Rating growth data
   */
  async calculateRatingGrowth(userId) {
    try {
      const entry = await LeaderboardEntry.findOne({ user: userId });
      
      if (!entry) {
        return null;
      }
      
      const now = new Date();
      const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
      const ninetyDaysAgo = new Date(now - 90 * 24 * 60 * 60 * 1000);
      
      // This is a simplified version - in production, you'd track historical ratings
      // For now, we'll just return 0 growth
      entry.performanceMetrics.ratingGrowth30d = 0;
      entry.performanceMetrics.ratingGrowth90d = 0;
      
      await entry.save();
      
      return {
        ratingGrowth30d: entry.performanceMetrics.ratingGrowth30d,
        ratingGrowth90d: entry.performanceMetrics.ratingGrowth90d
      };
      
    } catch (error) {
      console.error('Error calculating rating growth:', error);
      throw error;
    }
  }
}

export default LeaderboardService;
