import BasePlatformService from './BasePlatformService.js';
import axios from 'axios';
import PlatformData from '../../models/PlatformData.js';
import PlatformSubmission from '../../models/PlatformSubmission.js';
import PlatformRatingHistory from '../../models/PlatformRatingHistory.js';

class CodeforcesService extends BasePlatformService {
  constructor() {
    super('codeforces');
    this.baseURL = 'https://codeforces.com/api';
    this.rateLimit = {
      requestsPerSecond: 1,
      burstLimit: 5,
      lastRequestTime: 0
    };
  }

  /**
   * Rate limiting helper
   */
  async waitForRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.rateLimit.lastRequestTime;
    const minInterval = 1000 / this.rateLimit.requestsPerSecond;

    if (timeSinceLastRequest < minInterval) {
      await new Promise(resolve => setTimeout(resolve, minInterval - timeSinceLastRequest));
    }
    this.rateLimit.lastRequestTime = Date.now();
  }

  /**
   * Make API request with rate limiting and error handling
   */
  async makeRequest(endpoint, params = {}) {
    await this.waitForRateLimit();
    
    try {
      const response = await axios.get(`${this.baseURL}${endpoint}`, {
        params,
        timeout: 10000
      });

      if (response.data.status !== 'OK') {
        throw new Error(response.data.comment || 'API request failed');
      }

      return response.data.result;
    } catch (error) {
      if (error.response?.status === 400) {
        throw new Error('Invalid handle or request parameters');
      } else if (error.response?.status === 503) {
        throw new Error('Codeforces API is temporarily unavailable');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout - Codeforces API might be slow');
      }
      throw error;
    }
  }

  /**
   * Sync all data for a user and store in database
   * @param {string} userId - MongoDB user ID
   * @param {string} handle - Codeforces handle
   * @returns {Promise<Object>} Sync result
   */
  async syncUserData(userId, handle) {
    try {
      console.log(`Starting Codeforces data sync for ${handle}...`);

      // Validate handle first
      const isValidHandle = await this.validateHandle(handle);
      if (!isValidHandle) {
        throw new Error(`Handle ${handle} does not exist on Codeforces`);
      }

      // Fetch all data concurrently
      const [userInfo, submissions, ratingHistory] = await Promise.all([
        this.getUserInfo(handle),
        this.getAllSubmissions(handle),
        this.getRatingHistory(handle)
      ]);

      console.log(`Fetched ${submissions.length} submissions and ${ratingHistory.length} rating changes`);

      // Store raw platform data
      await this.storePlatformData(userId, handle, userInfo);
      
      // Store submissions
      if (submissions.length > 0) {
        await this.storeSubmissions(userId, handle, submissions);
      }

      // Store rating history
      if (ratingHistory.length > 0) {
        await this.storeRatingHistory(userId, handle, ratingHistory);
      }

      console.log(`Successfully synced Codeforces data for ${handle}`);

      return {
        success: true,
        platform: 'codeforces',
        handle,
        submissionsCount: submissions.length,
        ratingChanges: ratingHistory.length,
        lastSynced: new Date()
      };

    } catch (error) {
      console.error(`Codeforces sync error for ${handle}:`, error.message);
      throw error;
    }
  }

  /**
   * Store raw platform data
   * @param {string} userId - MongoDB user ID
   * @param {string} handle - Codeforces handle
   * @param {Object} userInfo - Raw user info from Codeforces API
   */
  async storePlatformData(userId, handle, userInfo) {
    const platformData = {
      user: userId,
      platform: 'codeforces',
      handle,
      rawData: {
        profile: userInfo,
        statistics: {},
        metadata: {
          apiVersion: '1.0',
          syncedAt: new Date()
        }
      },
      quickAccess: {
        currentRating: userInfo.rating || 0,
        maxRating: userInfo.maxRating || userInfo.rating || 0,
        rank: userInfo.rank || '',
        totalSolved: 0, // Will be calculated from submissions
        profileUrl: `https://codeforces.com/profile/${handle}`,
        avatarUrl: userInfo.avatar || ''
      },
      lastSynced: new Date(),
      isActive: true
    };

    await PlatformData.findOneAndUpdate(
      { user: userId, platform: 'codeforces' },
      platformData,
      { upsert: true, new: true }
    );
  }

  /**
   * Store submissions in raw format
   * @param {string} userId - MongoDB user ID
   * @param {string} handle - Codeforces handle
   * @param {Array} submissions - Raw submissions from Codeforces API
   */
  async storeSubmissions(userId, handle, submissions) {
    // Clear existing submissions for this user-platform combination
    await PlatformSubmission.deleteMany({ user: userId, platform: 'codeforces' });

    const submissionDocs = submissions.map(submission => ({
      user: userId,
      platform: 'codeforces',
      platformSubmissionId: submission.id.toString(),
      rawSubmissionData: submission,
      quickAccess: {
        problemId: `${submission.problem.contestId || 'gym'}${submission.problem.index || ''}`,
        problemName: submission.problem.name,
        verdict: submission.verdict,
        timestamp: new Date(submission.creationTimeSeconds * 1000),
        language: submission.programmingLanguage || '',
        problemData: submission.problem
      }
    }));

    // Insert submissions in batches to avoid memory issues
    const batchSize = 1000;
    for (let i = 0; i < submissionDocs.length; i += batchSize) {
      const batch = submissionDocs.slice(i, i + batchSize);
      await PlatformSubmission.insertMany(batch, { ordered: false });
    }

    // Update total solved count in platform data
    const acceptedCount = submissions.filter(sub => sub.verdict === 'OK').length;
    await PlatformData.findOneAndUpdate(
      { user: userId, platform: 'codeforces' },
      { 'quickAccess.totalSolved': acceptedCount }
    );
  }

  /**
   * Store rating history in raw format
   * @param {string} userId - MongoDB user ID
   * @param {string} handle - Codeforces handle
   * @param {Array} ratingHistory - Raw rating history from Codeforces API
   */
  async storeRatingHistory(userId, handle, ratingHistory) {
    // Clear existing rating history for this user-platform combination
    await PlatformRatingHistory.deleteMany({ user: userId, platform: 'codeforces' });

    const ratingDocs = ratingHistory.map(change => ({
      user: userId,
      platform: 'codeforces',
      platformContestId: change.contestId.toString(),
      rawRatingData: change,
      quickAccess: {
        contestName: change.contestName,
        contestDate: new Date(change.ratingUpdateTimeSeconds * 1000),
        oldRating: change.oldRating,
        newRating: change.newRating,
        ratingChange: change.newRating - change.oldRating,
        rank: change.rank,
        platformSpecific: {
          contestId: change.contestId,
          handle: change.handle
        }
      }
    }));

    if (ratingDocs.length > 0) {
      await PlatformRatingHistory.insertMany(ratingDocs);
    }
  }

  /**
   * Get user information from Codeforces (raw format)
   */
  async getUserInfo(handle) {
    try {
      const users = await this.makeRequest('/user.info', { handles: handle });
      
      if (!users || users.length === 0) {
        throw new Error('User not found');
      }

      return users[0]; // Return raw user data
    } catch (error) {
      this.handleError(error, 'get user info');
    }
  }

  /**
   * Get all submissions for a user (raw format)
   */
  async getAllSubmissions(handle, options = {}) {
    try {
      const { from = 1, count } = options;
      
      const params = { handle, from };
      if (count) params.count = count;

      const submissions = await this.makeRequest('/user.status', params);
      
      // Return raw submissions - no transformation
      return submissions || [];
    } catch (error) {
      this.handleError(error, 'get submissions');
    }
  }

  /**
   * Get rating history for a user (raw format)
   */
  async getRatingHistory(handle) {
    try {
      const ratingHistory = await this.makeRequest('/user.rating', { handle });
      
      // Return raw rating history - no transformation
      return ratingHistory || [];
    } catch (error) {
      this.handleError(error, 'get rating history');
    }
  }

  /**
   * Get platform-specific data for a user (for platform-specific views)
   * @param {string} userId - MongoDB user ID
   * @returns {Promise<Object>} Platform-specific data
   */
  async getPlatformSpecificData(userId) {
    try {
      const [platformData, submissions, ratingHistory] = await Promise.all([
        PlatformData.findOne({ user: userId, platform: 'codeforces', isActive: true }).lean(),
        PlatformSubmission.find({ user: userId, platform: 'codeforces' })
          .sort({ 'quickAccess.timestamp': -1 }).lean(),
        PlatformRatingHistory.find({ user: userId, platform: 'codeforces' })
          .sort({ 'quickAccess.contestDate': 1 }).lean()
      ]);

      if (!platformData) {
        return null;
      }

      // Calculate platform-specific statistics
      const acceptedSubmissions = submissions.filter(sub => sub.quickAccess.verdict === 'OK');
      const stats = this.calculateCodeforcesStats(submissions, acceptedSubmissions, ratingHistory);

      // Calculate heatmap from ALL submissions
      const heatmapData = this.calculateHeatmapFromSubmissions(submissions);

      return {
        platform: 'codeforces',
        handle: platformData.handle,
        profile: platformData.rawData.profile,
        statistics: stats,
        heatmap: heatmapData, // Add heatmap data
        submissions: submissions.slice(0, 50), // Latest 50 submissions
        ratingHistory: ratingHistory,
        lastSynced: platformData.lastSynced
      };

    } catch (error) {
      console.error('Error fetching Codeforces-specific data:', error);
      throw error;
    }
  }

  /**
   * Calculate heatmap from all submissions
   * @param {Array} submissions - All submissions
   * @returns {Object} Heatmap data with date keys
   */
  calculateHeatmapFromSubmissions(submissions) {
    const heatmap = {};
    
    submissions.forEach(submission => {
      const date = new Date(submission.quickAccess.timestamp);
      const dateKey = date.toISOString().split('T')[0];
      heatmap[dateKey] = (heatmap[dateKey] || 0) + 1;
    });
    
    return heatmap;
  }

  /**
   * Calculate Codeforces-specific statistics
   * @param {Array} allSubmissions - All submissions
   * @param {Array} acceptedSubmissions - Accepted submissions
   * @param {Array} ratingHistory - Rating history
   * @returns {Object} Codeforces-specific stats
   */
  calculateCodeforcesStats(allSubmissions, acceptedSubmissions, ratingHistory) {
    const stats = {
      totalSolved: acceptedSubmissions.length,
      totalSubmissions: allSubmissions.length,
      acceptanceRate: allSubmissions.length > 0 ? 
        (acceptedSubmissions.length / allSubmissions.length * 100).toFixed(1) : 0,
      
      // Codeforces-specific: Native rating distribution (actual Codeforces ratings)
      ratingMap: {},

      // Verdict distribution (Codeforces-specific)
      verdictDistribution: {},

      // Tag-based topic distribution (Codeforces format)
      topicDistribution: {},

      // Language usage
      languageDistribution: {},

      // Contest performance
      contestStats: {
        totalContests: ratingHistory.length,
        bestRank: ratingHistory.length > 0 ? Math.min(...ratingHistory.map(r => r.quickAccess.rank)) : null,
        averageRank: ratingHistory.length > 0 ? 
          Math.round(ratingHistory.reduce((sum, r) => sum + r.quickAccess.rank, 0) / ratingHistory.length) : null,
        ratingProgress: ratingHistory.length > 0 ? 
          ratingHistory[ratingHistory.length - 1].quickAccess.newRating - ratingHistory[0].quickAccess.oldRating : 0
      }
    };

    // Calculate native rating map
    acceptedSubmissions.forEach(submission => {
      const problem = submission.rawSubmissionData.problem;
      const rating = problem.rating;
      
      if (rating) {
        stats.ratingMap[rating] = (stats.ratingMap[rating] || 0) + 1;
      }

      // Topic distribution using Codeforces tags
      if (problem.tags && Array.isArray(problem.tags)) {
        problem.tags.forEach(tag => {
          stats.topicDistribution[tag] = (stats.topicDistribution[tag] || 0) + 1;
        });
      }
    });

    // Calculate verdict distribution
    allSubmissions.forEach(submission => {
      const verdict = submission.quickAccess.verdict;
      stats.verdictDistribution[verdict] = (stats.verdictDistribution[verdict] || 0) + 1;
    });

    // Calculate language distribution
    allSubmissions.forEach(submission => {
      const language = submission.quickAccess.language;
      if (language) {
        stats.languageDistribution[language] = (stats.languageDistribution[language] || 0) + 1;
      }
    });

    return stats;
  }

  /**
   * Get problem information
   */
  async getProblemInfo(problemId) {
    try {
      // For Codeforces, we need to parse contest ID and problem index
      const match = problemId.match(/^(\d+)([A-Z]+\d*)$/i);
      if (!match) {
        throw new Error('Invalid Codeforces problem ID format');
      }

      const [, contestId, index] = match;
      const problems = await this.makeRequest('/problemset.problems');
      
      const problem = problems.problems?.find(p => 
        p.contestId.toString() === contestId && p.index.toLowerCase() === index.toLowerCase()
      );

      if (!problem) {
        throw new Error('Problem not found');
      }

      return problem; // Return raw problem data
    } catch (error) {
      this.handleError(error, 'get problem info');
    }
  }

  /**
   * Validate if a handle exists
   */
  async validateHandle(handle) {
    try {
      const users = await this.makeRequest('/user.info', { handles: handle });
      return users && users.length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get rate limit configuration
   */
  getRateLimit() {
    return {
      requestsPerSecond: 1,
      burstLimit: 5
    };
  }
}

export default CodeforcesService;