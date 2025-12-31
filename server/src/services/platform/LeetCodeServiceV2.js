import BasePlatformService from './BasePlatformService.js';
import axios from 'axios';
import PlatformData from '../../models/PlatformData.js';
import PlatformSubmission from '../../models/PlatformSubmission.js';
import PlatformRatingHistory from '../../models/PlatformRatingHistory.js';

class LeetCodeService extends BasePlatformService {
  constructor() {
    super('leetcode');
    this.baseURL = 'https://leetcode.com/graphql';
    this.rateLimit = {
      requestsPerSecond: 0.5, // More conservative for LeetCode
      burstLimit: 3,
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
   * Make GraphQL request with rate limiting and error handling
   */
  async makeRequest(query, variables = {}) {
    await this.waitForRateLimit();
    
    try {
      const response = await axios.post(this.baseURL, {
        query,
        variables
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Referer': 'https://leetcode.com'
        },
        timeout: 15000
      });

      if (response.data.errors) {
        throw new Error(response.data.errors[0].message || 'GraphQL query failed');
      }

      return response.data.data;
    } catch (error) {
      if (error.response?.status === 400) {
        throw new Error('Invalid username or request parameters');
      } else if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded - please try again later');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout - LeetCode API might be slow');
      }
      throw error;
    }
  }

  /**
   * Sync all data for a user and store in database
   */
  async syncUserData(userId, username) {
    try {
      console.log(`Starting LeetCode data sync for ${username}...`);

      // Validate username first
      const isValidHandle = await this.validateHandle(username);
      if (!isValidHandle) {
        throw new Error(`Username ${username} does not exist on LeetCode`);
      }

      // Fetch all data concurrently
      const [userProfile, recentSubmissions, contestInfo, skillStats, languageStats] = await Promise.all([
        this.getUserInfo(username),
        this.getRecentSubmissions(username, 100),
        this.getContestInfo(username),
        this.getSkillStats(username),
        this.getLanguageStats(username)
      ]);

      console.log(`Fetched ${recentSubmissions.length} recent submissions for ${username}`);

      // Store raw platform data
      await this.storePlatformData(userId, username, userProfile, skillStats, languageStats);
      
      // Store submissions
      if (recentSubmissions.length > 0) {
        await this.storeSubmissions(userId, username, recentSubmissions);
      }

      // Store contest rating history
      if (contestInfo && contestInfo.history && contestInfo.history.length > 0) {
        await this.storeRatingHistory(userId, username, contestInfo.history);
      }

      console.log(`Successfully synced LeetCode data for ${username}`);

      return {
        success: true,
        platform: 'leetcode',
        handle: username,
        submissionsCount: recentSubmissions.length,
        ratingChanges: contestInfo?.history?.length || 0,
        lastSynced: new Date()
      };

    } catch (error) {
      console.error(`LeetCode sync error for ${username}:`, error.message);
      throw error;
    }
  }

  /**
   * Get user information from LeetCode
   */
  async getUserInfo(username) {
    const query = `
      query getUserProfile($username: String!) {
        allQuestionsCount {
          difficulty
          count
        }
        matchedUser(username: $username) {
          username
          profile {
            realName
            userAvatar
            ranking
            reputation
            countryName
            company
            school
            skillTags
            aboutMe
            websites
          }
          githubUrl
          twitterUrl
          linkedinUrl
          contributions {
            points
          }
          submissionCalendar
          submitStats {
            acSubmissionNum {
              difficulty
              count
              submissions
            }
            totalSubmissionNum {
              difficulty
              count
              submissions
            }
          }
          badges {
            id
            displayName
            icon
            creationDate
          }
        }
        matchedUserStats: matchedUser(username: $username) {
          submitStats: submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
              submissions
            }
            totalSubmissionNum {
              difficulty
              count
              submissions
            }
          }
        }
      }
    `;

    try {
      const data = await this.makeRequest(query, { username });
      
      if (!data.matchedUser) {
        throw new Error('User not found');
      }

      return {
        ...data.matchedUser,
        allQuestionsCount: data.allQuestionsCount,
        globalStats: data.matchedUserStats
      };
    } catch (error) {
      this.handleError(error, 'get user info');
    }
  }

  /**
   * Get recent submissions
   */
  async getRecentSubmissions(username, limit = 100) {
    const query = `
      query getRecentSubmissions($username: String!, $limit: Int) {
        recentSubmissionList(username: $username, limit: $limit) {
          title
          titleSlug
          timestamp
          statusDisplay
          lang
        }
      }
    `;

    try {
      const data = await this.makeRequest(query, { username, limit });
      return data.recentSubmissionList || [];
    } catch (error) {
      this.handleError(error, 'get recent submissions');
    }
  }

  /**
   * Get all submissions (accepted only for now)
   */
  async getAllSubmissions(username, options = {}) {
    const query = `
      query getACSubmissions($username: String!, $limit: Int) {
        recentAcSubmissionList(username: $username, limit: $limit) {
          title
          titleSlug
          timestamp
          statusDisplay
          lang
        }
      }
    `;

    try {
      const limit = options.limit || 200;
      const data = await this.makeRequest(query, { username, limit });
      return data.recentAcSubmissionList || [];
    } catch (error) {
      this.handleError(error, 'get all submissions');
    }
  }

  /**
   * Get contest information
   */
  async getContestInfo(username) {
    const query = `
      query userContestRankingInfo($username: String!) {
        userContestRanking(username: $username) {
          attendedContestsCount
          rating
          globalRanking
          totalParticipants
          topPercentage
          badge {
            name
          }
        }
        userContestRankingHistory(username: $username) {
          attended
          trendDirection
          problemsSolved
          totalProblems
          finishTimeInSeconds
          rating
          ranking
          contest {
            title
            startTime
          }
        }
      }
    `;

    try {
      const data = await this.makeRequest(query, { username });
      return {
        ranking: data.userContestRanking,
        history: data.userContestRankingHistory || []
      };
    } catch (error) {
      console.warn('Contest info not available for user:', username);
      return { ranking: null, history: [] };
    }
  }

  /**
   * Get skill statistics
   */
  async getSkillStats(username) {
    const query = `
      query skillStats($username: String!) {
        matchedUser(username: $username) {
          tagProblemCounts {
            advanced {
              tagName
              tagSlug
              problemsSolved
            }
            intermediate {
              tagName
              tagSlug
              problemsSolved
            }
            fundamental {
              tagName
              tagSlug
              problemsSolved
            }
          }
        }
      }
    `;

    try {
      const data = await this.makeRequest(query, { username });
      return data.matchedUser?.tagProblemCounts || null;
    } catch (error) {
      console.warn('Skill stats not available for user:', username);
      return null;
    }
  }

  /**
   * Get language statistics
   */
  async getLanguageStats(username) {
    const query = `
      query languageStats($username: String!) {
        matchedUser(username: $username) {
          languageProblemCount {
            languageName
            problemsSolved
          }
        }
      }
    `;

    try {
      const data = await this.makeRequest(query, { username });
      return data.matchedUser?.languageProblemCount || [];
    } catch (error) {
      console.warn('Language stats not available for user:', username);
      return [];
    }
  }

  /**
   * Get user calendar and streak
   */
  async getUserCalendar(username, year = new Date().getFullYear()) {
    const query = `
      query UserProfileCalendar($username: String!, $year: Int!) {
        matchedUser(username: $username) {
          userCalendar(year: $year) {
            activeYears
            streak
            totalActiveDays
            dccBadges {
              timestamp
              badge {
                name
                icon
              }
            }
            submissionCalendar
          }
        }
      }
    `;

    try {
      const data = await this.makeRequest(query, { username, year });
      return data.matchedUser?.userCalendar || null;
    } catch (error) {
      console.warn('Calendar data not available for user:', username);
      return null;
    }
  }

  /**
   * Store raw platform data
   */
  async storePlatformData(userId, username, userProfile, skillStats, languageStats) {
    // Calculate total solved and submissions from submitStats
    const acStats = userProfile.submitStats?.acSubmissionNum || [];
    const totalStats = userProfile.submitStats?.totalSubmissionNum || [];
    
    // Find "All" difficulty stats for totals
    const allAcStats = acStats.find(stat => stat.difficulty === 'All');
    const allTotalStats = totalStats.find(stat => stat.difficulty === 'All');
    
    const totalSolved = allAcStats?.count || 0;
    const totalSubmissions = allTotalStats?.submissions || 0;

    // Parse submission calendar for heatmap data
    let submissionHeatmap = {};
    if (userProfile.submissionCalendar) {
      try {
        const calendar = JSON.parse(userProfile.submissionCalendar);
        // Convert Unix timestamps to YYYY-MM-DD format
        Object.entries(calendar).forEach(([timestamp, count]) => {
          const date = new Date(parseInt(timestamp) * 1000);
          const dateKey = date.toISOString().split('T')[0];
          submissionHeatmap[dateKey] = count;
        });
      } catch (error) {
        console.error('Error parsing submission calendar:', error);
      }
    }

    // Get contest rating and calculate max rating from ATTENDED contests only
    let contestRating = 0;
    let maxContestRating = 0;
    try {
      const contestInfo = await this.getContestInfo(username);
      contestRating = contestInfo.ranking?.rating || 0;
      
      // Calculate max rating from ATTENDED contests only
      if (contestInfo.history && contestInfo.history.length > 0) {
        const attendedRatings = contestInfo.history
          .filter(r => r.attended === true)
          .map(r => Math.round(r.rating));
        
        if (attendedRatings.length > 0) {
          maxContestRating = Math.max(...attendedRatings);
        }
      }
      
      // Ensure current >= max
      maxContestRating = Math.max(maxContestRating, Math.round(contestRating));
    } catch (error) {
      console.warn('Could not fetch contest rating');
    }

    // Extract badges from profile
    const badges = userProfile.badges || [];

    const platformData = {
      user: userId,
      platform: 'leetcode',
      handle: username,
      rawData: {
        profile: userProfile, // userProfile already contains badges
        statistics: {
          skillStats,
          languageStats,
          allQuestionsCount: userProfile.allQuestionsCount,
          submissionHeatmap // Store parsed heatmap data
        },
        badges: badges, // ALSO store badges at top level for easy access
        metadata: {
          apiVersion: 'graphql',
          syncedAt: new Date()
        }
      },
      quickAccess: {
        currentRating: Math.round(contestRating),
        maxRating: maxContestRating,
        rank: userProfile.profile?.ranking || 0,
        totalSolved: totalSolved,
        totalSubmissions: totalSubmissions,
        profileUrl: `https://leetcode.com/${username}`,
        avatarUrl: userProfile.profile?.userAvatar || '',
        badgesCount: badges.length // Add badge count for quick access
      },
      lastSynced: new Date(),
      isActive: true
    };

    await PlatformData.findOneAndUpdate(
      { user: userId, platform: 'leetcode' },
      platformData,
      { upsert: true, new: true }
    );
  }

  /**
   * Store submissions in raw format
   */
  async storeSubmissions(userId, username, submissions) {
    // Clear existing submissions
    await PlatformSubmission.deleteMany({ user: userId, platform: 'leetcode' });

    const submissionDocs = submissions.map((submission, index) => ({
      user: userId,
      platform: 'leetcode',
      platformSubmissionId: `${username}-${submission.titleSlug}-${submission.timestamp}`,
      rawSubmissionData: submission,
      quickAccess: {
        problemId: submission.titleSlug,
        problemName: submission.title,
        verdict: submission.statusDisplay,
        timestamp: new Date(parseInt(submission.timestamp) * 1000),
        language: submission.lang || '',
        problemData: {
          titleSlug: submission.titleSlug,
          title: submission.title
        }
      }
    }));

    // Insert in batches
    const batchSize = 500;
    for (let i = 0; i < submissionDocs.length; i += batchSize) {
      const batch = submissionDocs.slice(i, i + batchSize);
      await PlatformSubmission.insertMany(batch, { ordered: false }).catch(err => {
        console.warn('Some submissions may already exist:', err.message);
      });
    }

    // Note: We don't update totalSolved here anymore since we get it from submitStats
    // The actual count will come from the platform data's submitStats
  }

  /**
   * Store contest rating history
   */
  async storeRatingHistory(userId, username, ratingHistory) {
    // Clear existing rating history
    await PlatformRatingHistory.deleteMany({ user: userId, platform: 'leetcode' });

    const ratingDocs = ratingHistory
      .filter(change => change.attended)
      .map(change => ({
        user: userId,
        platform: 'leetcode',
        platformContestId: change.contest.title.replace(/\s+/g, '-'),
        rawRatingData: change,
        quickAccess: {
          contestName: change.contest.title,
          contestDate: new Date(change.contest.startTime * 1000),
          oldRating: 0, // LeetCode doesn't provide old rating in history
          newRating: Math.round(change.rating),
          ratingChange: 0, // Calculate from adjacent entries if needed
          rank: change.ranking,
          platformSpecific: {
            problemsSolved: change.problemsSolved,
            totalProblems: change.totalProblems,
            finishTime: change.finishTimeInSeconds,
            trendDirection: change.trendDirection
          }
        }
      }));

    if (ratingDocs.length > 0) {
      await PlatformRatingHistory.insertMany(ratingDocs).catch(err => {
        console.warn('Some rating history entries may already exist:', err.message);
      });
    }
  }

  /**
   * Get platform-specific data for a user
   */
  async getPlatformSpecificData(userId) {
    try {
      const [platformData, submissions, ratingHistory] = await Promise.all([
        PlatformData.findOne({ user: userId, platform: 'leetcode', isActive: true }).lean(),
        PlatformSubmission.find({ user: userId, platform: 'leetcode' })
          .sort({ 'quickAccess.timestamp': -1 }).lean(),
        PlatformRatingHistory.find({ user: userId, platform: 'leetcode' })
          .sort({ 'quickAccess.contestDate': 1 }).lean()
      ]);

      if (!platformData) {
        return null;
      }

      // Calculate statistics
      const acceptedSubmissions = submissions.filter(sub => 
        sub.quickAccess.verdict === 'Accepted'
      );
      const stats = this.calculateLeetCodeStats(submissions, acceptedSubmissions, ratingHistory, platformData);

      // Get badges from the correct location - try both locations
      const badges = platformData.rawData.badges || platformData.rawData.profile?.badges || [];

      // Calculate heatmap from ALL submissions
      const heatmapData = this.calculateHeatmapFromSubmissions(submissions);

      return {
        platform: 'leetcode',
        handle: platformData.handle,
        profile: platformData.rawData.profile,
        badges: badges,
        statistics: stats,
        heatmap: heatmapData, // Add heatmap data
        submissions: submissions.slice(0, 50),
        ratingHistory: ratingHistory,
        lastSynced: platformData.lastSynced
      };

    } catch (error) {
      console.error('Error fetching LeetCode-specific data:', error);
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
   * Calculate LeetCode-specific statistics
   */
  calculateLeetCodeStats(allSubmissions, acceptedSubmissions, ratingHistory, platformData) {
    // Get statistics from submitStats instead of counting submissions
    const submitStats = platformData.rawData.profile.submitStats || {};
    const acSubmissionNum = submitStats.acSubmissionNum || [];
    const totalSubmissionNum = submitStats.totalSubmissionNum || [];
    
    // Find "All" difficulty stats
    const allAcStats = acSubmissionNum.find(stat => stat.difficulty === 'All');
    const allTotalStats = totalSubmissionNum.find(stat => stat.difficulty === 'All');
    
    const totalSolved = allAcStats?.count || 0;
    const totalSubmissions = allTotalStats?.submissions || 0;
    const acceptanceRate = totalSubmissions > 0 ? 
      ((totalSolved / totalSubmissions) * 100).toFixed(1) : '0.0';

    const stats = {
      totalSolved: totalSolved,
      totalSubmissions: totalSubmissions,
      acceptanceRate: acceptanceRate,
      
      // LeetCode difficulty distribution from submitStats
      difficultyDistribution: {
        Easy: 0,
        Medium: 0,
        Hard: 0
      },

      // Status distribution from actual submissions
      statusDistribution: {},

      // Topic distribution from skill stats
      topicDistribution: this.extractTopicDistribution(platformData),

      // Language usage from actual submissions
      languageDistribution: {},

      // Contest performance
      contestStats: {
        attendedContests: ratingHistory.length,
        currentRating: platformData.quickAccess.currentRating || 0,
        maxRating: platformData.quickAccess.maxRating || 0,
        bestRank: ratingHistory.length > 0 ? 
          Math.min(...ratingHistory.map(r => r.quickAccess.rank)) : null,
        averageRank: ratingHistory.length > 0 ? 
          Math.round(ratingHistory.reduce((sum, r) => sum + r.quickAccess.rank, 0) / ratingHistory.length) : null
      }
    };

    // Get difficulty distribution from submitStats (accepted problems)
    acSubmissionNum.forEach(stat => {
      if (stat.difficulty && stat.difficulty !== 'All' && stats.difficultyDistribution.hasOwnProperty(stat.difficulty)) {
        stats.difficultyDistribution[stat.difficulty] = stat.count;
      }
    });

    // Calculate status distribution from actual submissions
    allSubmissions.forEach(submission => {
      const status = submission.quickAccess.verdict;
      stats.statusDistribution[status] = (stats.statusDistribution[status] || 0) + 1;
    });

    // Calculate language distribution from actual submissions
    allSubmissions.forEach(submission => {
      const language = submission.quickAccess.language;
      if (language) {
        stats.languageDistribution[language] = (stats.languageDistribution[language] || 0) + 1;
      }
    });

    return stats;
  }

  /**
   * Extract topic distribution from skill stats
   */
  extractTopicDistribution(platformData) {
    const topicDist = {};
    const skillStats = platformData.rawData.statistics?.skillStats;

    if (skillStats) {
      ['advanced', 'intermediate', 'fundamental'].forEach(level => {
        const tags = skillStats[level] || [];
        tags.forEach(tag => {
          topicDist[tag.tagName] = tag.problemsSolved;
        });
      });
    }

    return topicDist;
  }

  /**
   * Get rating history for a user
   */
  async getRatingHistory(username) {
    const contestInfo = await this.getContestInfo(username);
    return contestInfo.history || [];
  }

  /**
   * Get problem information (not directly available, would need problem-specific query)
   */
  async getProblemInfo(problemSlug) {
    const query = `
      query selectProblem($titleSlug: String!) {
        question(titleSlug: $titleSlug) {
          questionId
          questionFrontendId
          title
          titleSlug
          difficulty
          isPaidOnly
          topicTags {
            name
            slug
          }
          likes
          dislikes
          similarQuestions
          stats
        }
      }
    `;

    try {
      const data = await this.makeRequest(query, { titleSlug: problemSlug });
      return data.question;
    } catch (error) {
      this.handleError(error, 'get problem info');
    }
  }

  /**
   * Validate if a username exists
   */
  async validateHandle(username) {
    try {
      const query = `
        query($username: String!) {
          matchedUser(username: $username) {
            username
          }
        }
      `;
      
      const data = await this.makeRequest(query, { username });
      return data && data.matchedUser !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if verification code exists in user's aboutMe/summary section
   * @param {string} username - LeetCode username
   * @param {string} verificationCode - The code to check for
   * @returns {Promise<boolean>} True if code is found in aboutMe
   */
  async checkVerificationCode(username, verificationCode) {
    try {
      const query = `
        query($username: String!) {
          matchedUser(username: $username) {
            profile {
              aboutMe
            }
          }
        }
      `;
      
      const data = await this.makeRequest(query, { username });
      
      if (!data || !data.matchedUser || !data.matchedUser.profile) {
        return false;
      }

      // Check if the verification code is in the aboutMe/summary field
      const aboutMe = data.matchedUser.profile.aboutMe || '';
      return aboutMe.includes(verificationCode);
    } catch (error) {
      console.error('Error checking LeetCode verification code:', error);
      return false;
    }
  }

  /**
   * Get rate limit configuration
   */
  getRateLimit() {
    return {
      requestsPerSecond: 0.5,
      burstLimit: 3
    };
  }
}

export default LeetCodeService;
