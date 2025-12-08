import CodeforcesServiceV2 from '../services/platform/CodeforcesServiceV2.js';
import LeetCodeServiceV2 from '../services/platform/LeetCodeServiceV2.js';
import User from '../models/User.js';
import PlatformData from '../models/PlatformData.js';
import LeaderboardService from '../services/leaderboardService.js';

const codeforcesService = new CodeforcesServiceV2();
const leetcodeService = new LeetCodeServiceV2();
const leaderboardService = new LeaderboardService();

/**
 * Platform Controller - Handles platform-specific detailed views
 * Provides platform-specific statistics and data in original platform format
 */

/**
 * Sync platform data for a user
 */
export async function syncPlatformData(req, res) {
  try {
    const { platform, handle } = req.body;
    const userId = req.user._id;

    if (!platform || !handle) {
      return res.status(400).json({
        success: false,
        message: 'Platform and handle are required'
      });
    }

    // Validate platform
    const supportedPlatforms = ['codeforces', 'leetcode'];
    if (!supportedPlatforms.includes(platform.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Platform ${platform} is not supported yet. Supported platforms: ${supportedPlatforms.join(', ')}`
      });
    }

    let result;
    
    // Route to appropriate platform service
    switch (platform.toLowerCase()) {
      case 'codeforces':
        result = await codeforcesService.syncUserData(userId, handle);
        break;
      case 'leetcode':
        result = await leetcodeService.syncUserData(userId, handle);
        break;
      default:
        return res.status(400).json({ success: false, message: 'Unsupported platform' });
    }

    // Trigger leaderboard rating recalculation after successful sync
    try {
      await leaderboardService.calculateAndUpdateUserRating(userId);
      console.log(`Leaderboard rating updated for user ${userId} after ${platform} sync`);
    } catch (leaderboardError) {
      // Don't fail the sync if leaderboard update fails
      console.error('Failed to update leaderboard rating:', leaderboardError);
    }

    res.json({
      success: true,
      message: `Successfully synced ${platform} data for ${handle}`,
      data: result
    });

  } catch (error) {
    console.error('Platform sync error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync platform data',
      error: error.message
    });
  }
}

/**
 * Sync all connected platforms for a user in parallel
 * Used for background sync when user views their own portfolio
 */
export async function syncAllPlatforms(req, res) {
  try {
    const userId = req.user._id;

    // Get all connected platforms for the user
    const connectedPlatforms = await PlatformData.find({ user: userId, isActive: true })
      .select('platform handle')
      .lean();

    if (!connectedPlatforms || connectedPlatforms.length === 0) {
      return res.json({
        success: true,
        message: 'No connected platforms to sync',
        data: {
          synced: [],
          failed: [],
          totalSynced: 0
        }
      });
    }

    // Sync all platforms in parallel
    const syncPromises = connectedPlatforms.map(async (platformData) => {
      const { platform, handle } = platformData;
      try {
        let result;
        switch (platform.toLowerCase()) {
          case 'codeforces':
            result = await codeforcesService.syncUserData(userId, handle);
            break;
          case 'leetcode':
            result = await leetcodeService.syncUserData(userId, handle);
            break;
          default:
            throw new Error(`Unsupported platform: ${platform}`);
        }
        return { platform, handle, success: true, result };
      } catch (error) {
        console.error(`Failed to sync ${platform} for ${handle}:`, error.message);
        return { platform, handle, success: false, error: error.message };
      }
    });

    const results = await Promise.all(syncPromises);

    const synced = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    // Trigger leaderboard rating recalculation if any platform synced successfully
    if (synced.length > 0) {
      try {
        await leaderboardService.calculateAndUpdateUserRating(userId);
        console.log(`Leaderboard rating updated for user ${userId} after sync-all`);
      } catch (leaderboardError) {
        console.error('Failed to update leaderboard rating:', leaderboardError);
      }
    }

    res.json({
      success: true,
      message: `Synced ${synced.length} of ${connectedPlatforms.length} platforms`,
      data: {
        synced: synced.map(s => ({ platform: s.platform, handle: s.handle })),
        failed: failed.map(f => ({ platform: f.platform, handle: f.handle, error: f.error })),
        totalSynced: synced.length
      }
    });

  } catch (error) {
    console.error('Sync all platforms error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync platforms',
      error: error.message
    });
  }
}

/**
 * Get Codeforces-specific data for authenticated user
 */
export async function getMyCodeforcesData(req, res) {
  try {
    const userId = req.user._id;
    
    const data = await codeforcesService.getPlatformSpecificData(userId);
    
    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'No Codeforces data found. Please sync your account first.'
      });
    }

    res.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('Error fetching Codeforces data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Codeforces data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Get Codeforces-specific data by username (public)
 */
export async function getCodeforcesDataByUsername(req, res) {
  try {
    const { username } = req.params;

    // Find user
    const user = await User.findOne({ username })
      .select('_id username name avatarUrl')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const data = await codeforcesService.getPlatformSpecificData(user._id);
    
    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'No Codeforces data found for this user'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          username: user.username,
          name: user.name,
          avatarUrl: user.avatarUrl
        },
        ...data
      }
    });

  } catch (error) {
    console.error('Error fetching Codeforces data by username:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Codeforces data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Get LeetCode-specific data for authenticated user
 */
export async function getMyLeetCodeData(req, res) {
  try {
    const userId = req.user._id;
    
    const data = await leetcodeService.getPlatformSpecificData(userId);
    
    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'No LeetCode data found. Please sync your account first.'
      });
    }

    res.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('Error fetching LeetCode data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch LeetCode data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Get LeetCode-specific data by username (public)
 */
export async function getLeetCodeDataByUsername(req, res) {
  try {
    const { username } = req.params;

    // Find user
    const user = await User.findOne({ username })
      .select('_id username name avatarUrl')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const data = await leetcodeService.getPlatformSpecificData(user._id);
    
    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'No LeetCode data found for this user'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          username: user.username,
          name: user.name,
          avatarUrl: user.avatarUrl
        },
        ...data
      }
    });

  } catch (error) {
    console.error('Error fetching LeetCode data by username:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch LeetCode data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Get CodeChef-specific data (placeholder for future implementation)
 */
export async function getCodeChefDataByUsername(req, res) {
  res.status(501).json({
    success: false,
    message: 'CodeChef integration is not implemented yet'
  });
}

/**
 * Get platform-specific statistics summary
 */
export async function getPlatformSummary(req, res) {
  try {
    const { username, platform } = req.params;

    const user = await User.findOne({ username })
      .select('_id username name avatarUrl')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let data;
    switch (platform.toLowerCase()) {
      case 'codeforces':
        data = await codeforcesService.getPlatformSpecificData(user._id);
        break;
      case 'leetcode':
        data = await leetcodeService.getPlatformSpecificData(user._id);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: `Platform ${platform} is not supported`
        });
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: `No ${platform} data found for this user`
      });
    }

    // Create platform-specific summary
    const summary = {
      user: {
        username: user.username,
        name: user.name,
        avatarUrl: user.avatarUrl
      },
      platform: platform.toLowerCase(),
      handle: data.handle,
      profile: {
        rating: data.profile.rating || data.statistics.contestStats?.currentRating || 0,
        maxRating: data.profile.maxRating || data.statistics.contestStats?.currentRating || 0,
        rank: data.profile.rank || 'unrated'
      },
      statistics: {
        totalSolved: data.statistics.totalSolved,
        totalSubmissions: data.statistics.totalSubmissions,
        acceptanceRate: data.statistics.acceptanceRate
      },
      lastSynced: data.lastSynced
    };

    // Add platform-specific metrics
    if (platform.toLowerCase() === 'codeforces') {
      summary.codeforcesSpecific = {
        ratingDistribution: data.statistics.ratingMap || data.statistics.ratingDistribution,
        contestStats: data.statistics.contestStats,
        topTopics: Object.entries(data.statistics.topicDistribution)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10)
          .map(([topic, count]) => ({ topic, count }))
      };
    } else if (platform.toLowerCase() === 'leetcode') {
      summary.leetcodeSpecific = {
        difficultyDistribution: data.statistics.difficultyDistribution,
        contestStats: data.statistics.contestStats,
        topTopics: Object.entries(data.statistics.topicDistribution)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10)
          .map(([topic, count]) => ({ topic, count }))
      };
    }

    res.json({
      success: true,
      data: summary
    });

  } catch (error) {
    console.error('Error fetching platform summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch platform summary',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}