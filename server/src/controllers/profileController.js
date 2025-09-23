// import CodeforcesService from '../services/platform/codeforcesService.js'; // DEPRECATED: Only used by old syncPlatformData implementation
import User from '../models/User.js';
import Profile from '../models/Profile.js';
import Problem from '../models/Problem.js';
import Submission from '../models/Submission.js';
import RatingHistory from '../models/RatingHistory.js';
import Contest from '../models/Contest.js';
import {
  calculateHeatmap,
  calculatePlatformHeatmap,
  calculateStreaks,
  calculateTopicDistribution,
  calculatePlatformTopicDistribution,
  calculateDifficultyDistribution,
  calculateCategoryDistribution,
  calculateLanguageDistribution,
  calculateAccuracyStats,
  calculatePlatformAccuracyStats,
  getRecentSubmissions,
  calculateOverallStats
} from '../utils/analyticsCalculator.js';

/**
 * Sanitize language name to be compatible with Mongoose Map
 * Replaces dots and other problematic characters with underscores
 */
function sanitizeLanguageName(language) {
  if (!language || typeof language !== 'string') {
    return 'Unknown';
  }
  return language.replace(/[.\s]+/g, '_').replace(/[^\w\-_+#]/g, '');
}

/**
 * Get platform service instance based on platform name
 * DEPRECATED: Only used by old syncPlatformData implementation
 */
/*
function getPlatformService(platform) {
  switch (platform.toLowerCase()) {
    case 'codeforces':
      return new CodeforcesService();
    default:
      throw new Error(`Platform ${platform} is not supported yet`);
  }
}
*/

/**
 * Sync platform data for a user
 */
export async function syncPlatformData(req, res) {
  try {
    // DEPRECATION NOTICE
    console.warn('WARNING: /api/v1/profile/sync is deprecated. Use /api/v1/platform/sync instead.');
    
    return res.status(200).json({
      success: false,
      deprecated: true,
      message: 'This endpoint is deprecated. Please use /api/v1/platform/sync for new implementations.',
      newEndpoint: '/api/v1/platform/sync',
      migration: {
        description: 'The new architecture provides unified portfolio views and platform-specific detailed views',
        unifiedPortfolio: '/api/v1/portfolio/:username',
        platformSpecific: '/api/v1/platform/:username/:platform'
      }
    });

    /*
    // OLD IMPLEMENTATION - COMMENTED OUT FOR TESTING NEW ARCHITECTURE
    const { platform, handle } = req.body;
    const userId = req.user._id;

    if (!platform || !handle) {
      return res.status(400).json({
        success: false,
        message: 'Platform and handle are required'
      });
    }

    // Validate platform
    const supportedPlatforms = ['codeforces', 'leetcode', 'codechef', 'hackerrank', 'atcoder', 'geeksforgeeks', 'code360', 'hackerearth'];
    if (!supportedPlatforms.includes(platform.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Unsupported platform'
      });
    }

    // Get platform service
    const service = getPlatformService(platform);

    // Validate handle exists on platform
    const isValidHandle = await service.validateHandle(handle);
    if (!isValidHandle) {
      return res.status(400).json({
        success: false,
        message: `Handle ${handle} does not exist on ${platform}`
      });
    }

    // Fetch all data concurrently
    console.log(`Starting data sync for ${handle} on ${platform}...`);
    
    const [userInfo, allSubmissions, ratingHistory] = await Promise.all([
      service.getUserInfo(handle),
      service.getAllSubmissions(handle),
      service.getRatingHistory(handle)
    ]);

    console.log(`Fetched ${allSubmissions.length} submissions and ${ratingHistory.length} rating changes`);

    // Process submissions - add missing fields and ensure problems exist
    const processedSubmissions = [];
    const problemsToCreate = [];
    const problemMap = new Map();

    for (const submission of allSubmissions) {
      const processed = await processSubmission(submission, platform, userId, problemMap);
      if (processed) {
        processedSubmissions.push(processed);
      }
    }

    // Process rating history
    const processedRatingHistory = [];
    
    for (const change of ratingHistory) {
      const processed = processRatingChange(change, platform, userId);
      if (processed) {
        processedRatingHistory.push(processed);
      }
    }

    // Database operations
    console.log('Starting database operations...');

    // Clear old data for this user and platform
    await Promise.all([
      Submission.deleteMany({ user: userId, platform: platform }),
      RatingHistory.deleteMany({ user: userId, platform: platform })
    ]);

    // Create new problems if needed
    if (problemsToCreate.length > 0) {
      await Problem.insertMany(problemsToCreate, { ordered: false });
    }

    // Insert new data
    if (processedSubmissions.length > 0) {
      await Submission.insertMany(processedSubmissions, { ordered: false });
    }

    if (processedRatingHistory.length > 0) {
      await RatingHistory.insertMany(processedRatingHistory, { ordered: false });
    }

    // Calculate analytics
    console.log('Calculating analytics...');
    
    // Get all user submissions for overall stats
    const allUserSubmissions = await Submission.find({ user: userId }).lean();
    
    const overallStats = calculateOverallStats(allUserSubmissions);
    const platformStats = calculatePlatformStats(allUserSubmissions, platform);
    const heatmapData = calculateHeatmap(allUserSubmissions);
    const platformHeatmap = calculatePlatformHeatmap(allUserSubmissions, platform);
    const streaks = calculateStreaks(heatmapData);
    const topicDistribution = calculateTopicDistribution(allUserSubmissions);
    const platformTopicDistribution = calculatePlatformTopicDistribution(allUserSubmissions, platform);
    const difficultyDistribution = calculateDifficultyDistribution(allUserSubmissions);
    const categoryDistribution = calculateCategoryDistribution(allUserSubmissions);
    const languageDistribution = calculateLanguageDistribution(allUserSubmissions);
    const accuracyStats = calculateAccuracyStats(allUserSubmissions);
    const platformAccuracyStats = calculatePlatformAccuracyStats(allUserSubmissions, platform);
    const recentSubmissions = getRecentSubmissions(allUserSubmissions);

    // Update profile
    const profileUpdate = {
      user: userId,
      codeMeshRating: calculateCodeMeshRating(allUserSubmissions),
      linkedAccounts: [{
        platform: platform,
        handle: handle,
        isVerified: true,
        rating: userInfo.rating || 0,
        maxRating: userInfo.maxRating || userInfo.rating || 0,
        rank: userInfo.rank || '',
        stars: 0,
        totalSolved: overallStats.totalSolved,
        lastSynced: new Date()
      }],
      overallStats: overallStats,
      platformStats: {
        [platform]: platformStats
      },
      streaks: streaks,
      heatmapData: {
        overall: heatmapData,
        byPlatform: {
          [platform]: platformHeatmap
        }
      },
      topicDistribution: {
        overall: topicDistribution,
        byPlatform: {
          [platform]: platformTopicDistribution
        }
      },
      languagesUsed: languageDistribution,
      recentSubmissions: recentSubmissions.map(sub => sub._id),
      lastRefresh: new Date(),
      updatedAt: new Date()
    };

    await Profile.findOneAndUpdate(
      { user: userId },
      profileUpdate,
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: 'Platform data synced successfully',
      data: {
        platform: platform,
        handle: handle,
        submissionsProcessed: processedSubmissions.length,
        ratingChanges: processedRatingHistory.length,
        totalSolved: overallStats.totalSolved,
        currentRating: userInfo.rating,
        maxRating: userInfo.maxRating
      }
    });
    */

  } catch (error) {
    const userId = req.user._id;

    if (!platform || !handle) {
      return res.status(400).json({
        success: false,
        message: 'Platform and handle are required'
      });
    }

    // Validate platform
    const supportedPlatforms = ['codeforces', 'leetcode', 'codechef', 'hackerrank', 'atcoder', 'geeksforgeeks', 'code360', 'hackerearth'];
    if (!supportedPlatforms.includes(platform.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Unsupported platform'
      });
    }

    // Get platform service
    const service = getPlatformService(platform);

    // Validate handle exists on platform
    const isValidHandle = await service.validateHandle(handle);
    if (!isValidHandle) {
      return res.status(400).json({
        success: false,
        message: 'Invalid handle or handle does not exist on platform'
      });
    }

    // Fetch all data concurrently
    console.log(`Starting data sync for ${handle} on ${platform}...`);
    
    const [userInfo, allSubmissions, ratingHistory] = await Promise.all([
      service.getUserInfo(handle),
      service.getAllSubmissions(handle),
      service.getRatingHistory(handle)
    ]);

    console.log(`Fetched ${allSubmissions.length} submissions and ${ratingHistory.length} rating changes`);

    // Process submissions - add missing fields and ensure problems exist
    const processedSubmissions = [];
    const problemsToCreate = [];
    const problemMap = new Map();

    for (const submission of allSubmissions) {
      // Create problem entry if it doesn't exist
      const problemKey = `${platform}-${submission.problemIdOnPlatform}`;
      
      if (!problemMap.has(problemKey)) {
        try {
          let problem = await Problem.findOne({
            platform: platform,
            problemIdOnPlatform: submission.problemIdOnPlatform
          });

          if (!problem) {
            const problemData = {
              platform: platform,
              problemIdOnPlatform: submission.problemIdOnPlatform,
              title: submission.problemName,
              url: `https://${platform}.com/problem/${submission.problemIdOnPlatform}`,
              difficulty: submission.difficulty || 'Medium',
              difficultyRating: submission.difficultyRating,
              category: submission.category || 'DSA',
              tags: submission.tags || [],
              contestId: submission.contestId
            };

            problem = new Problem(problemData);
            problemsToCreate.push(problem);
          }
          
          problemMap.set(problemKey, problem._id);
        } catch (error) {
          console.error(`Error processing problem ${submission.problemIdOnPlatform}:`, error);
          continue;
        }
      }

      // Add processed submission
      processedSubmissions.push({
        user: userId,
        platform: platform,
        submissionIdOnPlatform: submission.submissionIdOnPlatform,
        problem: problemMap.get(problemKey),
        problemIdOnPlatform: submission.problemIdOnPlatform,
        problemName: submission.problemName,
        verdict: submission.verdict,
        language: submission.language,
        tags: submission.tags || [],
        difficulty: submission.difficulty,
        difficultyRating: submission.difficultyRating,
        category: submission.category || 'DSA',
        contestId: submission.contestId,
        timeSpent: submission.timeSpent,
        memoryUsed: submission.memoryUsed,
        timestamp: submission.timestamp
      });
    }

    // Process rating history
    const processedRatingHistory = [];
    
    for (const change of ratingHistory) {
      // Find or create contest entry
      let contest = await Contest.findOne({
        platform: platform,
        contestIdOnPlatform: change.contestIdOnPlatform
      });

      if (!contest) {
        // Create a basic contest entry if it doesn't exist
        contest = new Contest({
          platform: platform,
          contestIdOnPlatform: change.contestIdOnPlatform,
          name: change.contestName,
          url: `https://${platform}.com/contest/${change.contestIdOnPlatform}`,
          startTime: change.contestTimestamp,
          endTime: new Date(change.contestTimestamp.getTime() + 2 * 60 * 60 * 1000), // Assume 2 hour duration
          duration: "2:00",
          durationSeconds: 7200,
          status: {
            name: 'Completed',
            color: 'gray'
          }
        });
        
        try {
          await contest.save();
        } catch (error) {
          console.error(`Error creating contest ${change.contestIdOnPlatform}:`, error);
          // Try to find if contest was created by another process
          contest = await Contest.findOne({
            platform: platform,
            contestIdOnPlatform: change.contestIdOnPlatform
          });
          
          if (!contest) {
            console.error(`Skipping rating history entry for contest ${change.contestIdOnPlatform}`);
            continue;
          }
        }
      }

      processedRatingHistory.push({
        user: userId,
        platform: platform,
        contest: contest._id,
        contestIdOnPlatform: change.contestIdOnPlatform,
        contestName: change.contestName,
        handle: change.handle,
        rank: change.rank,
        oldRating: change.oldRating,
        newRating: change.newRating,
        ratingChange: change.ratingChange,
        contestTimestamp: change.contestTimestamp
      });
    }

    // Database operations
    console.log('Starting database operations...');

    // Clear old data for this user and platform
    await Promise.all([
      Submission.deleteMany({ user: userId, platform: platform }),
      RatingHistory.deleteMany({ user: userId, platform: platform })
    ]);

    // Create new problems if needed
    if (problemsToCreate.length > 0) {
      await Problem.insertMany(problemsToCreate, { ordered: false });
    }

    // Insert new data
    if (processedSubmissions.length > 0) {
      await Submission.insertMany(processedSubmissions, { ordered: false });
    }

    if (processedRatingHistory.length > 0) {
      await RatingHistory.insertMany(processedRatingHistory, { ordered: false });
    }

    // Calculate analytics
    console.log('Calculating analytics...');
    
    // Get all user submissions for overall stats
    const allUserSubmissions = await Submission.find({ user: userId }).lean();
    
    const overallStats = calculateOverallStats(allUserSubmissions);
    const platformSpecificStats = calculateOverallStats(processedSubmissions);
    
    // Calculate heatmap data
    const overallHeatmap = calculateHeatmap(allUserSubmissions);
    const platformHeatmaps = {};
    const supportedPlatformsList = ['codeforces', 'leetcode', 'codechef'];
    
    for (const plt of supportedPlatformsList) {
      const platformSubmissions = allUserSubmissions.filter(sub => sub.platform === plt);
      if (platformSubmissions.length > 0) {
        platformHeatmaps[plt] = calculateHeatmap(platformSubmissions);
      }
    }

    // Calculate topic distributions
    const overallTopics = calculateTopicDistribution(allUserSubmissions);
    const platformTopics = {};
    
    for (const plt of supportedPlatformsList) {
      const platformSubmissions = allUserSubmissions.filter(sub => sub.platform === plt);
      if (platformSubmissions.length > 0) {
        platformTopics[plt] = calculateTopicDistribution(platformSubmissions);
      }
    }

    // Update or create profile
    let profile = await Profile.findOne({ user: userId });
    
    if (!profile) {
      profile = new Profile({ user: userId });
    }

    // Update linked account info
    const accountIndex = profile.linkedAccounts.findIndex(acc => acc.platform === platform);
    const accountData = {
      platform: platform,
      handle: handle,
      isVerified: true,
      rating: userInfo.rating,
      maxRating: userInfo.maxRating,
      rank: userInfo.rank,
      totalSolved: overallStats.totalSolved,
      lastSynced: new Date()
    };

    if (accountIndex >= 0) {
      profile.linkedAccounts[accountIndex] = accountData;
    } else {
      profile.linkedAccounts.push(accountData);
    }

    // Update overall stats
    profile.overallStats = {
      totalSolved: overallStats.totalSolved,
      cpSolved: overallStats.CP || 0,
      dsaSolved: overallStats.DSA || 0,
      fundamentalsSolved: overallStats.Fundamentals || 0,
      difficulty: {
        easy: overallStats.easy || 0,
        medium: overallStats.medium || 0,
        hard: overallStats.hard || 0,
        expert: overallStats.expert || 0
      },
      accuracy: overallStats.accuracy || 0,
      averageAttempts: overallStats.averageAttempts || 0
    };

    // Update platform stats
    profile.platformStats.set(platform, {
      totalSolved: platformSpecificStats.totalSolved,
      difficulty: {
        easy: platformSpecificStats.easy || 0,
        medium: platformSpecificStats.medium || 0,
        hard: platformSpecificStats.hard || 0,
        expert: platformSpecificStats.expert || 0
      },
      accuracy: platformSpecificStats.accuracy || 0,
      averageAttempts: platformSpecificStats.averageAttempts || 0
    });

    // Update streaks
    profile.streaks = {
      currentStreak: overallStats.currentStreak || 0,
      maxStreak: overallStats.maxStreak || 0,
      activeDays: overallStats.activeDays || 0
    };

    // Update heatmap data
    profile.heatmapData = {
      overall: overallHeatmap,
      byPlatform: platformHeatmaps
    };

    // Update topic distribution
    profile.topicDistribution = {
      overall: overallTopics,
      byPlatform: platformTopics
    };

    // Update languages used with sanitized keys
    const sanitizedLanguages = new Map();
    if (overallStats.languageDistribution) {
      Object.entries(overallStats.languageDistribution).forEach(([lang, count]) => {
        const sanitizedLang = sanitizeLanguageName(lang);
        sanitizedLanguages.set(sanitizedLang, count);
      });
    }
    profile.languagesUsed = sanitizedLanguages;

    // Update recent submissions
    const recentSubmissionIds = getRecentSubmissions(allUserSubmissions, 10)
      .map(sub => sub._id);
    profile.recentSubmissions = recentSubmissionIds;

    // Update timestamps
    profile.lastRefresh = new Date();
    profile.updatedAt = new Date();

    await profile.save();

    console.log('Data sync completed successfully');

    res.json({
      success: true,
      message: 'Platform data synced successfully',
      data: {
        platform: platform,
        handle: handle,
        submissionsProcessed: processedSubmissions.length,
        ratingChanges: processedRatingHistory.length,
        totalSolved: overallStats.totalSolved,
        currentRating: userInfo.rating,
        maxRating: userInfo.maxRating
      }
    });

    /*
  } catch (error) {
    console.error('Error syncing platform data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync platform data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
  */
}
}

/**
 * Get user profile data
 */
export async function getProfile(req, res) {
  try {
    const userId = req.user._id;

    const profile = await Profile.findOne({ user: userId })
      .populate('user', 'username name avatarUrl bio college location nationality socials profileViews')
      .populate('recentSubmissions')
      .lean();

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    res.json({
      success: true,
      data: profile
    });

  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Get public profile by username
 */
export async function getPublicProfile(req, res) {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username }).select('-password -mfaSecret');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const profile = await Profile.findOne({ user: user._id })
      .populate('user', 'username name avatarUrl bio college location nationality socials profileViews')
      .populate('recentSubmissions')
      .lean();

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Increment profile views
    await User.findByIdAndUpdate(user._id, { $inc: { profileViews: 1 } });

    res.json({
      success: true,
      data: profile
    });

  } catch (error) {
    console.error('Error fetching public profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
