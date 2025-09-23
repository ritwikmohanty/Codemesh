import PlatformData from '../models/PlatformData.js';
import PlatformSubmission from '../models/PlatformSubmission.js';
import PlatformRatingHistory from '../models/PlatformRatingHistory.js';
import { getConverter, UnifiedConverter } from '../utils/platformConverter.js';
import { calculateBadges } from '../utils/badgeCalculator.js';

/**
 * UnificationService - Converts platform-specific data to unified format
 * This service takes raw platform data and creates unified portfolio views
 */
class UnificationService {
  
  /**
   * Get unified portfolio data for a user across all platforms
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Unified portfolio data
   */
  async getUnifiedPortfolio(userId) {
    try {
      console.log(`Generating unified portfolio for user: ${userId}`);

      // Fetch all platform data for the user
      const [platformData, submissions, ratingHistory] = await Promise.all([
        PlatformData.find({ user: userId, isActive: true }).lean(),
        PlatformSubmission.find({ user: userId }).lean(),
        PlatformRatingHistory.find({ user: userId }).lean()
      ]);

      if (!platformData || platformData.length === 0) {
        return this.getEmptyPortfolio();
      }

      // Convert platform-specific data to unified format
      const unifiedData = await this.processUnifiedData({
        userId,
        platformData,
        submissions,
        ratingHistory
      });

      return unifiedData;

    } catch (error) {
      console.error('Error generating unified portfolio:', error);
      throw new Error(`Failed to generate unified portfolio: ${error.message}`);
    }
  }

  /**
   * Process and unify data from all platforms
   * @param {Object} params - Object containing userId, platformData, submissions, ratingHistory
   * @returns {Promise<Object>} Processed unified data
   */
  async processUnifiedData({ userId, platformData, submissions, ratingHistory }) {
    // Initialize unified structure
    const unified = {
      userId,
      linkedAccounts: [],
      overallStats: {
        totalSolved: 0,
        totalSubmissions: 0,
        acceptanceRate: 0,
        difficulty: {
          easy: 0,
          medium: 0,
          hard: 0,
          expert: 0
        },
        categories: {
          cp: 0,
          dsa: 0,
          fundamentals: 0
        }
      },
      codeMeshRating: 0,
      platformStats: {},
      activityData: {
        heatmap: {},
        streaks: {
          current: 0,
          longest: 0,
          active: false
        }
      },
      topicDistribution: {},
      languageStats: {},
      ratingProgression: [],
      badges: [],
      recentActivity: []
    };

    // Process each platform's data
    for (const platform of platformData) {
      await this.processPlatformData(platform, submissions, ratingHistory, unified);
    }

    // Calculate final unified metrics
    this.calculateUnifiedMetrics(unified);

    return unified;
  }

  /**
   * Process data for a specific platform and add to unified data
   * @param {Object} platformData - Raw platform data
   * @param {Array} allSubmissions - All user submissions
   * @param {Array} allRatingHistory - All user rating history
   * @param {Object} unified - Unified data object to update
   */
  async processPlatformData(platformData, allSubmissions, allRatingHistory, unified) {
    const { platform, handle, rawData, quickAccess } = platformData;
    const converter = getConverter(platform);

    if (!converter) {
      console.warn(`No converter found for platform: ${platform}`);
      return;
    }

    // Get platform-specific submissions and rating history
    const platformSubmissions = allSubmissions.filter(sub => sub.platform === platform);
    const platformRating = allRatingHistory.filter(rating => rating.platform === platform);

    // Add to linked accounts
    unified.linkedAccounts.push({
      platform,
      handle,
      rating: quickAccess.currentRating || 0,
      maxRating: quickAccess.maxRating || 0,
      rank: quickAccess.rank || '',
      totalSolved: this.countAcceptedSubmissions(platformSubmissions),
      profileUrl: quickAccess.profileUrl || '',
      avatarUrl: quickAccess.avatarUrl || '',
      lastSynced: platformData.lastSynced,
      isVerified: true
    });

    // Process submissions for unified stats
    const acceptedSubmissions = platformSubmissions.filter(sub => 
      this.isAcceptedSubmission(sub.quickAccess.verdict, platform)
    );

    // Convert submissions to unified format
    const unifiedSubmissions = acceptedSubmissions.map(submission => 
      this.convertSubmissionToUnified(submission, converter)
    ).filter(Boolean);

    // Update overall stats
    this.updateOverallStats(unified.overallStats, unifiedSubmissions, platformSubmissions);

    // Update platform-specific stats
    unified.platformStats[platform] = this.calculatePlatformStats(
      platformSubmissions, 
      acceptedSubmissions, 
      converter
    );

    // Update activity data
    this.updateActivityData(unified.activityData, unifiedSubmissions);

    // Update topic distribution
    this.updateTopicDistribution(unified.topicDistribution, unifiedSubmissions);

    // Update language stats
    this.updateLanguageStats(unified.languageStats, platformSubmissions);

    // Add to rating progression
    if (platformRating.length > 0) {
      unified.ratingProgression.push({
        platform,
        history: this.convertRatingHistory(platformRating, converter)
      });
    }
  }

  /**
   * Convert platform submission to unified format
   * @param {Object} submission - Platform submission
   * @param {Object} converter - Platform converter
   * @returns {Object} Unified submission data
   */
  convertSubmissionToUnified(submission, converter) {
    const { rawSubmissionData, quickAccess } = submission;
    
    // Extract problem data based on platform
    const problemData = rawSubmissionData.problem || {};
    const unifiedProblem = converter.problemToUnified ? 
      converter.problemToUnified(problemData) : null;

    if (!unifiedProblem) return null;

    const { category, topics } = converter.tagsToCategories ? 
      converter.tagsToCategories(problemData.tags || []) : 
      { category: 'DSA', topics: [] };

    return {
      problemId: quickAccess.problemId,
      problemName: quickAccess.problemName,
      difficulty: converter.ratingToDifficulty ? 
        converter.ratingToDifficulty(problemData.rating) : 'Medium',
      category,
      topics,
      language: quickAccess.language,
      timestamp: quickAccess.timestamp,
      platform: submission.platform,
      rating: problemData.rating || null
    };
  }

  /**
   * Update overall statistics with submissions from a platform
   * @param {Object} overallStats - Overall stats object to update
   * @param {Array} unifiedSubmissions - Accepted submissions in unified format
   * @param {Array} allPlatformSubmissions - All submissions from platform
   */
  updateOverallStats(overallStats, unifiedSubmissions, allPlatformSubmissions) {
    overallStats.totalSolved += unifiedSubmissions.length;
    overallStats.totalSubmissions += allPlatformSubmissions.length;

    // Update difficulty distribution
    unifiedSubmissions.forEach(sub => {
      const diff = sub.difficulty?.toLowerCase();
      if (diff && overallStats.difficulty.hasOwnProperty(diff)) {
        overallStats.difficulty[diff]++;
      }
    });

    // Update category distribution
    unifiedSubmissions.forEach(sub => {
      const category = sub.category?.toLowerCase();
      if (category && overallStats.categories.hasOwnProperty(category)) {
        overallStats.categories[category]++;
      }
    });
  }

  /**
   * Calculate platform-specific statistics
   * @param {Array} allSubmissions - All submissions for platform
   * @param {Array} acceptedSubmissions - Accepted submissions for platform
   * @param {Object} converter - Platform converter
   * @returns {Object} Platform statistics
   */
  calculatePlatformStats(allSubmissions, acceptedSubmissions, converter) {
    const stats = {
      totalSolved: acceptedSubmissions.length,
      totalSubmissions: allSubmissions.length,
      acceptanceRate: allSubmissions.length > 0 ? 
        (acceptedSubmissions.length / allSubmissions.length * 100).toFixed(1) : 0,
      difficulty: { easy: 0, medium: 0, hard: 0, expert: 0 },
      languageDistribution: {},
      topicDistribution: {},
      recentSubmissions: acceptedSubmissions
        .sort((a, b) => new Date(b.quickAccess.timestamp) - new Date(a.quickAccess.timestamp))
        .slice(0, 10)
    };

    // Calculate difficulty distribution for this platform
    acceptedSubmissions.forEach(submission => {
      const problemData = submission.rawSubmissionData.problem || {};
      const difficulty = converter.ratingToDifficulty ? 
        converter.ratingToDifficulty(problemData.rating)?.toLowerCase() : 'medium';
      
      if (stats.difficulty.hasOwnProperty(difficulty)) {
        stats.difficulty[difficulty]++;
      }
    });

    return stats;
  }

  /**
   * Update activity heatmap and streak data
   * @param {Object} activityData - Activity data object to update
   * @param {Array} submissions - Submissions to process
   */
  updateActivityData(activityData, submissions) {
    // Update heatmap
    submissions.forEach(sub => {
      const dateKey = new Date(sub.timestamp).toISOString().split('T')[0];
      activityData.heatmap[dateKey] = (activityData.heatmap[dateKey] || 0) + 1;
    });

    // Calculate streaks (will be done in calculateUnifiedMetrics)
  }

  /**
   * Update topic distribution across platforms
   * @param {Object} topicDistribution - Topic distribution object to update
   * @param {Array} submissions - Submissions with unified topics
   */
  updateTopicDistribution(topicDistribution, submissions) {
    submissions.forEach(sub => {
      if (sub.topics && Array.isArray(sub.topics)) {
        sub.topics.forEach(topic => {
          topicDistribution[topic] = (topicDistribution[topic] || 0) + 1;
        });
      }
    });
  }

  /**
   * Update language usage statistics
   * @param {Object} languageStats - Language stats object to update
   * @param {Array} submissions - All submissions from platform
   */
  updateLanguageStats(languageStats, submissions) {
    submissions.forEach(sub => {
      const language = sub.quickAccess.language;
      if (language) {
        languageStats[language] = (languageStats[language] || 0) + 1;
      }
    });
  }

  /**
   * Convert platform rating history to unified format
   * @param {Array} ratingHistory - Platform rating history
   * @param {Object} converter - Platform converter
   * @returns {Array} Unified rating history
   */
  convertRatingHistory(ratingHistory, converter) {
    return ratingHistory
      .sort((a, b) => new Date(a.quickAccess.contestDate) - new Date(b.quickAccess.contestDate))
      .map(rating => ({
        contestName: rating.quickAccess.contestName,
        date: rating.quickAccess.contestDate,
        oldRating: rating.quickAccess.oldRating,
        newRating: rating.quickAccess.newRating,
        change: rating.quickAccess.ratingChange,
        rank: rating.quickAccess.rank
      }));
  }

  /**
   * Calculate final unified metrics
   * @param {Object} unified - Unified data object
   */
  calculateUnifiedMetrics(unified) {
    // Calculate acceptance rate
    if (unified.overallStats.totalSubmissions > 0) {
      unified.overallStats.acceptanceRate = (
        (unified.overallStats.totalSolved / unified.overallStats.totalSubmissions) * 100
      ).toFixed(1);
    }

    // Calculate CodeMesh rating
    const platformRatings = unified.linkedAccounts.map(account => ({
      platform: account.platform,
      rating: account.rating,
      maxRating: account.maxRating
    }));
    unified.codeMeshRating = UnifiedConverter.calculateCodeMeshRating(platformRatings);

    // Calculate streaks from heatmap
    unified.activityData.streaks = this.calculateStreaks(unified.activityData.heatmap);

    // Sort topics by frequency
    unified.topicDistribution = this.sortObjectByValue(unified.topicDistribution);

    // Sort languages by usage
    unified.languageStats = this.sortObjectByValue(unified.languageStats);

    // Calculate badges (placeholder - implement based on achievements)
    unified.badges = this.calculateUnifiedBadges(unified);
  }

  /**
   * Calculate streaks from heatmap data
   * @param {Object} heatmap - Heatmap data
   * @returns {Object} Streak information
   */
  calculateStreaks(heatmap) {
    const dates = Object.keys(heatmap).sort();
    if (dates.length === 0) {
      return { current: 0, longest: 0, active: false };
    }

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Calculate longest streak
    for (let i = 1; i < dates.length; i++) {
      const currentDate = new Date(dates[i]);
      const previousDate = new Date(dates[i - 1]);
      const dayDiff = (currentDate - previousDate) / (1000 * 60 * 60 * 24);

      if (dayDiff === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    // Calculate current streak
    let streakEnd = dates.length - 1;
    while (streakEnd > 0) {
      const currentDate = new Date(dates[streakEnd]);
      const previousDate = new Date(dates[streakEnd - 1]);
      const dayDiff = (currentDate - previousDate) / (1000 * 60 * 60 * 24);

      if (dayDiff === 1) {
        currentStreak++;
        streakEnd--;
      } else {
        break;
      }
    }
    if (streakEnd === 0 && dates.length > 0) currentStreak++;

    // Check if streak is active (solved today or yesterday)
    const active = heatmap[today] > 0 || heatmap[yesterday] > 0;

    return {
      current: currentStreak,
      longest: longestStreak,
      active
    };
  }

  /**
   * Calculate unified badges based on achievements across platforms
   * @param {Object} unified - Unified data
   * @returns {Array} Array of badges
   */
  calculateUnifiedBadges(unified) {
    const badges = [];

    // First solve badge
    if (unified.overallStats.totalSolved >= 1) {
      badges.push({
        name: 'First Solve',
        description: 'Solved your first problem',
        iconUrl: '/badges/first-solve.png',
        earnedAt: new Date()
      });
    }

    // Problem count badges
    const milestones = [10, 50, 100, 250, 500, 1000];
    milestones.forEach(milestone => {
      if (unified.overallStats.totalSolved >= milestone) {
        badges.push({
          name: `${milestone} Problems`,
          description: `Solved ${milestone} problems across all platforms`,
          iconUrl: `/badges/${milestone}-problems.png`,
          earnedAt: new Date()
        });
      }
    });

    // Streak badges
    if (unified.activityData.streaks.longest >= 7) {
      badges.push({
        name: 'Week Warrior',
        description: 'Maintained a 7-day solving streak',
        iconUrl: '/badges/week-warrior.png',
        earnedAt: new Date()
      });
    }

    return badges;
  }

  /**
   * Helper function to check if submission is accepted
   * @param {string} verdict - Platform-specific verdict
   * @param {string} platform - Platform name
   * @returns {boolean} Whether submission is accepted
   */
  isAcceptedSubmission(verdict, platform) {
    const acceptedVerdicts = {
      codeforces: ['OK'],
      leetcode: ['Accepted'],
      codechef: ['AC'],
      hackerrank: ['Accepted']
    };

    const platformAccepted = acceptedVerdicts[platform] || ['Accepted', 'OK', 'AC'];
    return platformAccepted.includes(verdict);
  }

  /**
   * Count accepted submissions from platform submissions
   * @param {Array} submissions - Platform submissions
   * @returns {number} Count of accepted submissions
   */
  countAcceptedSubmissions(submissions) {
    return submissions.filter(sub => 
      this.isAcceptedSubmission(sub.quickAccess.verdict, sub.platform)
    ).length;
  }

  /**
   * Sort object by values in descending order
   * @param {Object} obj - Object to sort
   * @returns {Object} Sorted object
   */
  sortObjectByValue(obj) {
    return Object.entries(obj)
      .sort(([,a], [,b]) => b - a)
      .reduce((result, [key, value]) => {
        result[key] = value;
        return result;
      }, {});
  }

  /**
   * Get empty portfolio structure
   * @returns {Object} Empty portfolio data
   */
  getEmptyPortfolio() {
    return {
      linkedAccounts: [],
      overallStats: {
        totalSolved: 0,
        totalSubmissions: 0,
        acceptanceRate: 0,
        difficulty: { easy: 0, medium: 0, hard: 0, expert: 0 },
        categories: { cp: 0, dsa: 0, fundamentals: 0 }
      },
      codeMeshRating: 0,
      platformStats: {},
      activityData: {
        heatmap: {},
        streaks: { current: 0, longest: 0, active: false }
      },
      topicDistribution: {},
      languageStats: {},
      ratingProgression: [],
      badges: [],
      recentActivity: []
    };
  }
}

export default UnificationService;