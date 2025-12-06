import LeaderboardService from '../services/leaderboardService.js';
import User from '../models/User.js';

const leaderboardService = new LeaderboardService();

/**
 * Leaderboard Controller
 * Handles HTTP requests for leaderboard operations
 */

/**
 * Get global leaderboard with pagination and filters
 * GET /api/v1/leaderboard
 */
export async function getGlobalLeaderboard(req, res) {
  try {
    const {
      page = 1,
      limit = 50,
      tier = null,
      college = null,
      country = null,
      graduationYear = null
    } = req.query;
    
    const options = {
      page: parseInt(page),
      limit: Math.min(parseInt(limit), 100), // Max 100 per page
      tier,
      college,
      country,
      graduationYear: graduationYear ? parseInt(graduationYear) : null,
      sortBy: 'masterRating',
      sortOrder: 'desc'
    };
    
    const result = await leaderboardService.getLeaderboard(options);
    
    res.json(result);
    
  } catch (error) {
    console.error('Error fetching global leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Get top N users from leaderboard
 * GET /api/v1/leaderboard/top/:count
 */
export async function getTopUsers(req, res) {
  try {
    const count = Math.min(parseInt(req.params.count) || 10, 100);
    const {
      tier = null,
      college = null,
      country = null,
      graduationYear = null
    } = req.query;
    
    const result = await leaderboardService.getLeaderboard({
      page: 1,
      limit: count,
      tier,
      college,
      country,
      graduationYear: graduationYear ? parseInt(graduationYear) : null,
      sortBy: 'masterRating',
      sortOrder: 'desc'
    });
    
    res.json({
      success: true,
      data: result.data,
      count: result.data.length
    });
    
  } catch (error) {
    console.error('Error fetching top users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch top users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Get authenticated user's leaderboard position
 * GET /api/v1/leaderboard/me
 */
export async function getMyLeaderboardEntry(req, res) {
  try {
    const userId = req.user._id;
    
    const result = await leaderboardService.getUserLeaderboardEntry(userId);
    
    if (!result.success) {
      return res.status(404).json(result);
    }
    
    res.json(result);
    
  } catch (error) {
    console.error('Error fetching user leaderboard entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard entry',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Get leaderboard entry by username (public)
 * GET /api/v1/leaderboard/user/:username
 */
export async function getLeaderboardEntryByUsername(req, res) {
  try {
    const { username } = req.params;
    
    // Find user
    const user = await User.findOne({ username }).select('_id').lean();
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const result = await leaderboardService.getUserLeaderboardEntry(user._id);
    
    if (!result.success) {
      return res.status(404).json(result);
    }
    
    res.json(result);
    
  } catch (error) {
    console.error('Error fetching leaderboard entry by username:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard entry',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Get leaderboard statistics
 * GET /api/v1/leaderboard/stats
 */
export async function getLeaderboardStats(req, res) {
  try {
    const result = await leaderboardService.getLeaderboardStats();
    
    res.json(result);
    
  } catch (error) {
    console.error('Error fetching leaderboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Get users filtered by tier
 * GET /api/v1/leaderboard/tier/:tier
 */
export async function getLeaderboardByTier(req, res) {
  try {
    const { tier } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    const validTiers = [
      'Newbie', 'Pupil', 'Specialist', 'Expert', 
      'Candidate Master', 'Master', 'Grandmaster', 'Legendary Grandmaster'
    ];
    
    if (!validTiers.includes(tier)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid tier',
        validTiers
      });
    }
    
    const result = await leaderboardService.getLeaderboard({
      page: parseInt(page),
      limit: Math.min(parseInt(limit), 100),
      tier,
      sortBy: 'masterRating',
      sortOrder: 'desc'
    });
    
    res.json(result);
    
  } catch (error) {
    console.error('Error fetching leaderboard by tier:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard by tier',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Recalculate rating for authenticated user
 * POST /api/v1/leaderboard/recalculate
 */
export async function recalculateMyRating(req, res) {
  try {
    const userId = req.user._id;
    
    const result = await leaderboardService.calculateAndUpdateUserRating(userId);
    
    res.json(result);
    
  } catch (error) {
    console.error('Error recalculating user rating:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to recalculate rating',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Admin endpoint: Recalculate ratings for all users
 * POST /api/v1/leaderboard/admin/recalculate-all
 */
export async function recalculateAllRatings(req, res) {
  try {
    // Check if user is admin (you should implement proper admin check)
    // For now, this is open but should be protected in production
    
    const {
      batchSize = 50,
      onlyActive = true,
      minSubmissions = 0
    } = req.body || {};
    
    // Start async process (don't wait for completion)
    leaderboardService.recalculateAllRatings({
      batchSize,
      onlyActive,
      minSubmissions
    }).then(result => {
      console.log('Batch recalculation completed:', result);
    }).catch(error => {
      console.error('Batch recalculation failed:', error);
    });
    
    res.json({
      success: true,
      message: 'Batch recalculation started. This may take several minutes.',
      status: 'processing'
    });
    
  } catch (error) {
    console.error('Error starting batch recalculation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start batch recalculation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Get users around a specific rank (context view)
 * GET /api/v1/leaderboard/context/:rank
 */
export async function getLeaderboardContext(req, res) {
  try {
    const rank = parseInt(req.params.rank);
    const range = parseInt(req.query.range) || 5; // Show 5 above and 5 below
    
    if (rank < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid rank'
      });
    }
    
    // Calculate page that contains this rank
    const pageSize = range * 2 + 1; // Total entries to show
    const startRank = Math.max(1, rank - range);
    const page = Math.floor(startRank / pageSize) + 1;
    
    const result = await leaderboardService.getLeaderboard({
      page,
      limit: pageSize,
      sortBy: 'masterRating',
      sortOrder: 'desc'
    });
    
    res.json({
      success: true,
      data: result.data,
      targetRank: rank,
      range
    });
    
  } catch (error) {
    console.error('Error fetching leaderboard context:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard context',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Search users in leaderboard
 * GET /api/v1/leaderboard/search
 */
export async function searchLeaderboard(req, res) {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    
    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    const result = await leaderboardService.getLeaderboard({
      page: parseInt(page),
      limit: Math.min(parseInt(limit), 50),
      search: q.trim(),
      sortBy: 'masterRating',
      sortOrder: 'desc'
    });
    
    res.json(result);
    
  } catch (error) {
    console.error('Error searching leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search leaderboard',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Get platform-specific leaderboard
 * GET /api/v1/leaderboard/platform/:platform
 */
export async function getPlatformLeaderboard(req, res) {
  try {
    const { platform } = req.params;
    const { 
      page = 1, 
      limit = 50,
      tier = null,
      college = null,
      country = null,
      graduationYear = null
    } = req.query;
    
    // Validate platform
    const validPlatforms = ['codeforces', 'leetcode'];
    if (!validPlatforms.includes(platform.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid platform. Must be one of: ${validPlatforms.join(', ')}`
      });
    }
    
    const result = await leaderboardService.getPlatformLeaderboard({
      platform: platform.toLowerCase(),
      page: parseInt(page),
      limit: Math.min(parseInt(limit), 100),
      tier,
      college,
      country,
      graduationYear: graduationYear ? parseInt(graduationYear) : null
    });
    
    res.json(result);
    
  } catch (error) {
    console.error(`Error fetching ${req.params.platform} leaderboard:`, error);
    res.status(500).json({
      success: false,
      message: `Failed to fetch ${req.params.platform} leaderboard`,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Get top N users for a specific platform
 * GET /api/v1/leaderboard/platform/:platform/top/:count
 */
export async function getTopUsersByPlatform(req, res) {
  try {
    const { platform, count } = req.params;
    const {
      tier = null,
      college = null,
      country = null,
      graduationYear = null
    } = req.query;
    
    // Validate platform
    const validPlatforms = ['codeforces', 'leetcode'];
    if (!validPlatforms.includes(platform.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid platform. Must be one of: ${validPlatforms.join(', ')}`
      });
    }
    
    const topCount = Math.min(parseInt(count) || 10, 100);
    
    const result = await leaderboardService.getTopUsersByPlatform({
      platform: platform.toLowerCase(),
      count: topCount,
      tier,
      college,
      country,
      graduationYear: graduationYear ? parseInt(graduationYear) : null
    });
    
    res.json(result);
    
  } catch (error) {
    console.error(`Error fetching top ${req.params.platform} users:`, error);
    res.status(500).json({
      success: false,
      message: `Failed to fetch top ${req.params.platform} users`,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
