import PlatformData from '../models/PlatformData.js';
import PlatformSubmission from '../models/PlatformSubmission.js';
import PlatformRatingHistory from '../models/PlatformRatingHistory.js';
import { getConverter, UnifiedConverter } from '../utils/platformConverter.js';
import { calculateBadges } from '../utils/badgeCalculator.js';
import { normalizeTopicName, normalizeTopics } from '../utils/topicMapper.js';

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

    // Extract topic distribution from platform-specific data (for LeetCode)
    let platformTopicDistribution = {};
    if (platform === 'leetcode' && rawData.statistics?.skillStats) {
      platformTopicDistribution = this.extractLeetCodeTopics(rawData.statistics.skillStats);
      // Add to unified topic distribution with normalization
      this.updateTopicDistributionFromMap(unified.topicDistribution, platformTopicDistribution, platform);
    }

    // Get platform-specific submissions and rating history
    const platformSubmissions = allSubmissions.filter(sub => sub.platform === platform);
    const platformRating = allRatingHistory.filter(rating => rating.platform === platform);

    // Calculate total solved and update category counts
    let totalSolved = 0;
    if (platform === 'leetcode') {
      // For LeetCode, use submitStats from profile data
      const submitStats = rawData.profile?.submitStats?.acSubmissionNum || [];
      const allAcStats = submitStats.find(stat => stat.difficulty === 'All');
      totalSolved = allAcStats?.count || 0;
      
      // **CRITICAL FIX**: Update DSA category count for LeetCode
      unified.overallStats.categories.dsa += totalSolved;
    } else if (platform === 'codeforces') {
      // For Codeforces, count accepted submissions
      const acceptedSubmissions = platformSubmissions.filter(sub => 
        this.isAcceptedSubmission(sub.quickAccess.verdict, platform)
      );
      totalSolved = acceptedSubmissions.length;
      
      // **CRITICAL FIX**: Update CP category count for Codeforces
      unified.overallStats.categories.cp += totalSolved;
    } else {
      // For other platforms, count accepted submissions
      totalSolved = this.countAcceptedSubmissions(platformSubmissions);
    }

    // Add to linked accounts
    unified.linkedAccounts.push({
      platform,
      handle,
      rating: quickAccess.currentRating || 0,
      maxRating: quickAccess.maxRating || 0,
      rank: quickAccess.rank || '',
      totalSolved: totalSolved,
      profileUrl: quickAccess.profileUrl || '',
      avatarUrl: quickAccess.avatarUrl || '',
      lastSynced: platformData.lastSynced,
      isVerified: platformData.isVerified || false,
      verifiedAt: platformData.verifiedAt || null,
      badgesCount: quickAccess.badgesCount || 0
    });

    // Add platform badges to unified badges
    let platformBadges = [];
    
    if (platform === 'leetcode') {
      platformBadges = rawData.badges || rawData.profile?.badges || [];
    } else if (rawData.badges && Array.isArray(rawData.badges)) {
      platformBadges = rawData.badges;
    }

    if (platformBadges.length > 0) {
      platformBadges.forEach(badge => {
        unified.badges.push({
          platform: platform,
          id: badge.id,
          name: badge.displayName || badge.name,
          description: `Earned on ${platform.charAt(0).toUpperCase() + platform.slice(1)}`,
          iconUrl: badge.icon,
          earnedAt: badge.creationDate ? new Date(badge.creationDate) : new Date(),
          category: 'platform_achievement'
        });
      });
    }

    // Process submissions for unified stats
    const acceptedSubmissions = platformSubmissions.filter(sub => 
      this.isAcceptedSubmission(sub.quickAccess.verdict, platform)
    );

    // For LeetCode, handle difficulty distribution differently
    if (platform === 'leetcode') {
      // Add difficulty distribution from submitStats to overall stats
      const submitStats = rawData.profile?.submitStats?.acSubmissionNum || [];
      submitStats.forEach(stat => {
        if (stat.difficulty && stat.difficulty !== 'All') {
          const difficultyKey = stat.difficulty.toLowerCase();
          if (unified.overallStats.difficulty.hasOwnProperty(difficultyKey)) {
            unified.overallStats.difficulty[difficultyKey] += stat.count;
          }
        }
      });
      
      // Update total solved and submissions from submitStats
      const allAcStats = submitStats.find(stat => stat.difficulty === 'All');
      const totalStats = rawData.profile?.submitStats?.totalSubmissionNum || [];
      const allTotalStats = totalStats.find(stat => stat.difficulty === 'All');
      
      unified.overallStats.totalSolved += allAcStats?.count || 0;
      unified.overallStats.totalSubmissions += allTotalStats?.submissions || 0;
    } else {
      // For other platforms, convert submissions to unified format and update stats
      const unifiedSubmissions = acceptedSubmissions.map(submission => 
        this.convertSubmissionToUnified(submission, converter)
      ).filter(Boolean);
      
      this.updateOverallStats(unified.overallStats, unifiedSubmissions, platformSubmissions);
    }

    // Update platform-specific stats
    unified.platformStats[platform] = this.calculatePlatformStats(
      platformSubmissions, 
      acceptedSubmissions, 
      converter,
      platform === 'leetcode' ? rawData.profile : null,
      platform,
      platformTopicDistribution
    );

    // Add platform-specific heatmap
    const platformHeatmap = {};
    if (platform === 'leetcode' && rawData.statistics?.submissionHeatmap) {
      Object.assign(platformHeatmap, rawData.statistics.submissionHeatmap);
    } else {
      platformSubmissions.forEach(sub => {
        const dateKey = new Date(sub.quickAccess.timestamp).toISOString().split('T')[0];
        platformHeatmap[dateKey] = (platformHeatmap[dateKey] || 0) + 1;
      });
    }
    unified.platformStats[platform].heatmap = platformHeatmap;

    // Update activity data
    if (platform === 'leetcode' && rawData.statistics?.submissionHeatmap) {
      this.updateActivityDataFromHeatmap(unified.activityData, rawData.statistics.submissionHeatmap);
    } else {
      this.updateActivityDataFromSubmissions(unified.activityData, platformSubmissions);
    }

    // Update topic distribution
    if (platform === 'codeforces') {
      // For Codeforces, update from unified submissions
      const unifiedSubmissions = acceptedSubmissions.map(submission => 
        this.convertSubmissionToUnified(submission, converter)
      ).filter(Boolean);
      this.updateTopicDistribution(unified.topicDistribution, unifiedSubmissions);
    }
    // For LeetCode, topics are already added from skillStats earlier

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
   * Update activity data from pre-calculated heatmap (LeetCode)
   * @param {Object} activityData - Activity data object to update
   * @param {Object} heatmap - Pre-calculated heatmap data
   */
  updateActivityDataFromHeatmap(activityData, heatmap) {
    // Merge heatmap data
    Object.entries(heatmap).forEach(([date, count]) => {
      activityData.heatmap[date] = (activityData.heatmap[date] || 0) + count;
    });
  }

  /**
   * Update activity data from all submissions (Codeforces and others)
   * @param {Object} activityData - Activity data object to update
   * @param {Array} submissions - ALL submissions to process (not filtered)
   */
  updateActivityDataFromSubmissions(activityData, submissions) {
    // Update heatmap from ALL submissions
    submissions.forEach(sub => {
      const dateKey = new Date(sub.quickAccess.timestamp).toISOString().split('T')[0];
      activityData.heatmap[dateKey] = (activityData.heatmap[dateKey] || 0) + 1;
    });
  }

  /**
   * Update activity heatmap and streak data
   * @param {Object} activityData - Activity data object to update
   * @param {Array} submissions - Submissions to process
   * @deprecated Use updateActivityDataFromSubmissions or updateActivityDataFromHeatmap instead
   */
  updateActivityData(activityData, submissions) {
    // This method is now deprecated in favor of the new methods
    // Keeping for backwards compatibility
    this.updateActivityDataFromSubmissions(activityData, submissions.map(sub => ({
      quickAccess: { timestamp: sub.timestamp }
    })));
  }

  /**
   * Convert platform submission to unified format
   * @param {Object} submission - Platform submission
   * @param {Object} converter - Platform converter
   * @returns {Object} Unified submission data
   */
  convertSubmissionToUnified(submission, converter) {
    const { rawSubmissionData, quickAccess, platform } = submission;
    
    // Extract problem data based on platform
    let problemData, unifiedProblem, category, topics;
    
    if (platform === 'codeforces') {
      problemData = rawSubmissionData.problem || {};
      unifiedProblem = converter.problemToUnified ? 
        converter.problemToUnified(problemData) : null;

      if (!unifiedProblem) return null;

      // For Codeforces: ALL questions are categorized as CP
      category = 'CP';
      
      // Extract and normalize topics
      const tags = problemData.tags || [];
      topics = normalizeTopics(tags, platform);
    } else if (platform === 'leetcode') {
      // For LeetCode, we need to handle differently since problem data is minimal
      problemData = quickAccess.problemData || {};
      
      // LeetCode uses difficulty directly
      const difficulty = converter.difficultyToUnified ? 
        converter.difficultyToUnified(problemData.difficulty || 'Medium') : 'Medium';
      
      // Create a simplified unified problem
      unifiedProblem = {
        id: quickAccess.problemId,
        name: quickAccess.problemName,
        difficulty: difficulty,
        rating: null,
        url: `https://leetcode.com/problems/${quickAccess.problemId}`
      };
      
      // For LeetCode: ALL questions are categorized as DSA
      category = 'DSA';
      
      // Topics will be extracted from skillStats at platform level, not per submission
      // So we leave this empty here
      topics = [];
    } else {
      return null;
    }

    return {
      problemId: quickAccess.problemId,
      problemName: quickAccess.problemName,
      difficulty: unifiedProblem.difficulty,
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

    // Update category distribution - use the category from unified submission
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
   * @param {Object} profileData - Additional profile data (for LeetCode)
   * @param {string} platform - Platform name
   * @param {Object} platformTopicDistribution - Pre-calculated topic distribution for the platform
   * @returns {Object} Platform statistics
   */
  calculatePlatformStats(allSubmissions, acceptedSubmissions, converter, profileData = null, platform = '', platformTopicDistribution = {}) {
    let totalSolved, totalSubmissions, acceptanceRate;
    
    if (profileData && profileData.submitStats) {
      // LeetCode: Use submitStats for accurate counts
      const acStats = profileData.submitStats.acSubmissionNum || [];
      const totalStats = profileData.submitStats.totalSubmissionNum || [];
      
      const allAcStats = acStats.find(stat => stat.difficulty === 'All');
      const allTotalStats = totalStats.find(stat => stat.difficulty === 'All');
      
      totalSolved = allAcStats?.count || 0;
      totalSubmissions = allTotalStats?.submissions || 0;
      acceptanceRate = totalSubmissions > 0 ? 
        ((totalSolved / totalSubmissions) * 100).toFixed(1) : '0.0';
    } else {
      // Other platforms: Count from submissions
      totalSolved = acceptedSubmissions.length;
      totalSubmissions = allSubmissions.length;
      acceptanceRate = totalSubmissions > 0 ? 
        ((totalSolved / totalSubmissions) * 100).toFixed(1) : '0.0';
    }

    const stats = {
      totalSolved: totalSolved,
      totalSubmissions: totalSubmissions,
      acceptanceRate: acceptanceRate,
      difficulty: { easy: 0, medium: 0, hard: 0, expert: 0 },
      languageDistribution: {},
      topicDistribution: {},
      recentSubmissions: acceptedSubmissions
        .sort((a, b) => new Date(b.quickAccess.timestamp) - new Date(a.quickAccess.timestamp))
        .slice(0, 10)
    };

    // Use pre-calculated topic distribution if available (for LeetCode)
    if (platform === 'leetcode' && Object.keys(platformTopicDistribution).length > 0) {
      // Normalize LeetCode topics
      Object.entries(platformTopicDistribution).forEach(([topic, count]) => {
        const normalizedTopic = normalizeTopicName(topic, platform);
        stats.topicDistribution[normalizedTopic] = count;
      });
    } else if (platform === 'codeforces') {
      // For Codeforces, extract topics from submissions
      acceptedSubmissions.forEach(submission => {
        const problemData = submission.rawSubmissionData.problem || {};
        const tags = problemData.tags || [];
        
        tags.forEach(tag => {
          const normalizedTopic = normalizeTopicName(tag, platform);
          stats.topicDistribution[normalizedTopic] = (stats.topicDistribution[normalizedTopic] || 0) + 1;
        });
      });
    }

    if (profileData && profileData.submitStats) {
      // LeetCode: Get difficulty distribution from submitStats
      const acStats = profileData.submitStats.acSubmissionNum || [];
      acStats.forEach(stat => {
        if (stat.difficulty && stat.difficulty !== 'All') {
          const difficultyKey = stat.difficulty.toLowerCase();
          if (stats.difficulty.hasOwnProperty(difficultyKey)) {
            stats.difficulty[difficultyKey] = stat.count;
          }
        }
      });
    } else {
      // Other platforms: Calculate difficulty distribution from submissions
      acceptedSubmissions.forEach(submission => {
        const problemData = submission.rawSubmissionData.problem || {};
        const difficulty = converter.ratingToDifficulty ? 
          converter.ratingToDifficulty(problemData.rating)?.toLowerCase() : 'medium';
        
        if (stats.difficulty.hasOwnProperty(difficulty)) {
          stats.difficulty[difficulty]++;
        }
      });
    }

    return stats;
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
          // Normalize the topic name before adding
          const normalizedTopic = normalizeTopicName(topic, sub.platform);
          topicDistribution[normalizedTopic] = (topicDistribution[normalizedTopic] || 0) + 1;
        });
      }
    });
  }

  /**
   * Update topic distribution from a map (used for LeetCode skillStats)
   * @param {Object} topicDistribution - Topic distribution object to update
   * @param {Object} topicMap - Map of topic names to counts
   * @param {string} platform - Platform name for normalization
   */
  updateTopicDistributionFromMap(topicDistribution, topicMap, platform) {
    Object.entries(topicMap).forEach(([topic, count]) => {
      // Normalize the topic name before adding
      const normalizedTopic = normalizeTopicName(topic, platform);
      topicDistribution[normalizedTopic] = (topicDistribution[normalizedTopic] || 0) + count;
    });
  }

  /**
   * Extract topics from LeetCode skillStats
   * @param {Object} skillStats - LeetCode skill statistics
   * @returns {Object} Topic distribution map
   */
  extractLeetCodeTopics(skillStats) {
    const topicDistribution = {};
    
    if (!skillStats) return topicDistribution;
    
    // Process all skill levels: advanced, intermediate, fundamental
    ['advanced', 'intermediate', 'fundamental'].forEach(level => {
      const tags = skillStats[level] || [];
      tags.forEach(tag => {
        const topicName = tag.tagName || tag.name;
        const problemsSolved = tag.problemsSolved || 0;
        
        if (topicName && problemsSolved > 0) {
          topicDistribution[topicName] = problemsSolved;
        }
      });
    });
    
    return topicDistribution;
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

    // Sort heatmap by date (chronologically)
    const sortedHeatmap = {};
    Object.keys(unified.activityData.heatmap)
      .sort((a, b) => new Date(a) - new Date(b))
      .forEach(date => {
        sortedHeatmap[date] = unified.activityData.heatmap[date];
      });
    unified.activityData.heatmap = sortedHeatmap;

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
   * @param {Object} heatmap - Heatmap data with date keys and activity counts
   * @returns {Object} Streak information
   */
  calculateStreaks(heatmap) {
    const dates = Object.keys(heatmap).sort();
    if (dates.length === 0) {
      return { current: 0, longest: 0, active: false };
    }

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Helper function to check if a date has activity
    const hasActivity = (date) => (heatmap[date] || 0) > 0;

    // Calculate longest streak
    let longestStreak = 1;
    let tempStreak = 1;

    for (let i = 1; i < dates.length; i++) {
      const currentDate = new Date(dates[i]);
      const previousDate = new Date(dates[i - 1]);
      const dayDiff = (currentDate - previousDate) / (1000 * 60 * 60 * 24);

      if (dayDiff === 1) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }

    // Calculate current streak (ending with today or yesterday)
    let currentStreak = 0;
    let checkDate = hasActivity(today) ? today : (hasActivity(yesterday) ? yesterday : null);

    if (checkDate) {
      currentStreak = 1; // Start with the current day
      let prevDate = new Date(checkDate);
      prevDate.setDate(prevDate.getDate() - 1);

      while (true) {
        const prevDateKey = prevDate.toISOString().split('T')[0];
        if (hasActivity(prevDateKey)) {
          currentStreak++;
          prevDate.setDate(prevDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // Check if streak is active (has activity today or yesterday)
    const active = hasActivity(today) || hasActivity(yesterday);

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
    const badges = [...unified.badges]; // Start with platform badges already added

    // First solve badge
    if (unified.overallStats.totalSolved >= 1) {
      badges.push({
        platform: 'codemesh',
        name: 'First Solve',
        description: 'Solved your first problem',
        iconUrl: '/badges/first-solve.png',
        earnedAt: new Date(),
        category: 'milestone'
      });
    }

    // Problem count badges
    const milestones = [10, 50, 100, 250, 500, 1000];
    milestones.forEach(milestone => {
      if (unified.overallStats.totalSolved >= milestone) {
        badges.push({
          platform: 'codemesh',
          name: `${milestone} Problems`,
          description: `Solved ${milestone} problems across all platforms`,
          iconUrl: `/badges/${milestone}-problems.png`,
          earnedAt: new Date(),
          category: 'milestone'
        });
      }
    });

    // Streak badges
    if (unified.activityData.streaks.longest >= 7) {
      badges.push({
        platform: 'codemesh',
        name: 'Week Warrior',
        description: 'Maintained a 7-day solving streak',
        iconUrl: '/badges/week-warrior.png',
        earnedAt: new Date(),
        category: 'streak'
      });
    }

    // Add more streak milestones
    if (unified.activityData.streaks.longest >= 30) {
      badges.push({
        platform: 'codemesh',
        name: 'Month Master',
        description: 'Maintained a 30-day solving streak',
        iconUrl: '/badges/month-master.png',
        earnedAt: new Date(),
        category: 'streak'
      });
    }

    if (unified.activityData.streaks.longest >= 100) {
      badges.push({
        platform: 'codemesh',
        name: 'Consistency King',
        description: 'Maintained a 100-day solving streak',
        iconUrl: '/badges/consistency-king.png',
        earnedAt: new Date(),
        category: 'streak'
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