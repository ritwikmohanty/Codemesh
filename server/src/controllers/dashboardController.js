import User from '../models/User.js';
import Profile from '../models/Profile.js';
import Submission from '../models/Submission.js';
import RatingHistory from '../models/RatingHistory.js';
import Problem from '../models/Problem.js';

/**
 * Convert Map to plain object, handling potential undefined values
 */
function mapToObject(map) {
  if (!map || typeof map !== 'object') {
    return {};
  }
  if (map instanceof Map) {
    return Object.fromEntries(map);
  }
  return map;
}

/**
 * Get comprehensive dashboard data by username
 */
export async function getDashboardByUsername(req, res) {
  try {
    const { username } = req.params;

    // Find user and populate basic info
    const user = await User.findOne({ username })
      .select('-password -mfaSecret -googleId')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get profile data
    const profile = await Profile.findOne({ user: user._id })
      .populate('recentSubmissions', 'problemName verdict language timestamp platform')
      .lean();

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Get recent submissions with problem details
    const recentSubmissions = await Submission.find({ user: user._id })
      .populate('problem', 'title url difficulty tags category')
      .sort({ timestamp: -1 })
      .limit(20)
      .lean();

    // Get complete rating history for all platforms
    const ratingHistory = await RatingHistory.find({ user: user._id })
      .sort({ contestTimestamp: 1 })
      .lean();

    // Group rating history by platform
    const ratingHistoryByPlatform = {};
    ratingHistory.forEach(entry => {
      if (!ratingHistoryByPlatform[entry.platform]) {
        ratingHistoryByPlatform[entry.platform] = [];
      }
      ratingHistoryByPlatform[entry.platform].push(entry);
    });

    // Get unsolved problems (attempted but not accepted)
    const unsolvedProblems = await Submission.aggregate([
      { $match: { user: user._id } },
      {
        $group: {
          _id: '$problem',
          hasAccepted: { $max: { $cond: [{ $eq: ['$verdict', 'Accepted'] }, 1, 0] } },
          attempts: { $sum: 1 },
          lastAttempt: { $max: '$timestamp' }
        }
      },
      { $match: { hasAccepted: 0 } },
      {
        $lookup: {
          from: 'problems',
          localField: '_id',
          foreignField: '_id',
          as: 'problem'
        }
      },
      { $unwind: '$problem' },
      { $sort: { lastAttempt: -1 } },
      { $limit: 10 }
    ]);

    // Get problems solved per rating range (for rating distribution analysis)
    const ratingDistribution = await Submission.aggregate([
      { $match: { user: user._id, verdict: 'Accepted' } },
      {
        $lookup: {
          from: 'problems',
          localField: 'problem',
          foreignField: '_id',
          as: 'problemDetails'
        }
      },
      { $unwind: '$problemDetails' },
      {
        $group: {
          _id: '$problemDetails._id',
          rating: { $first: '$problemDetails.difficultyRating' },
          platform: { $first: '$problemDetails.platform' }
        }
      },
      {
        $bucket: {
          groupBy: '$rating',
          boundaries: [0, 800, 1000, 1200, 1400, 1600, 1800, 2000, 2200, 2400, 2600, 3000, 4000],
          default: 'unrated',
          output: {
            count: { $sum: 1 },
            problems: { $push: '$$ROOT' }
          }
        }
      }
    ]);

    // Calculate additional statistics
    const totalSubmissions = await Submission.countDocuments({ user: user._id });
    const acceptedSubmissions = await Submission.countDocuments({ 
      user: user._id, 
      verdict: 'Accepted' 
    });

    // Get contest participation statistics
    const contestStats = {
      totalContests: ratingHistory.length,
      bestRank: ratingHistory.length > 0 ? Math.min(...ratingHistory.map(r => r.rank || Infinity)) : null,
      averageRank: ratingHistory.length > 0 ? 
        Math.round(ratingHistory.reduce((sum, r) => sum + (r.rank || 0), 0) / ratingHistory.length) : null
    };

    // Calculate time-based statistics
    const firstSubmission = await Submission.findOne({ user: user._id })
      .sort({ timestamp: 1 })
      .select('timestamp')
      .lean();

    const accountAge = firstSubmission ? 
      Math.floor((Date.now() - new Date(firstSubmission.timestamp)) / (1000 * 60 * 60 * 24)) : 0;

    // Increment profile view count
    await User.findByIdAndUpdate(user._id, { $inc: { profileViews: 1 } });

    // Compile comprehensive dashboard response
    const dashboardData = {
      user: {
        ...user,
        profileViews: user.profileViews + 1 // Include the incremented view
      },
      profile: {
        ...profile,
        // Convert Maps to Objects for JSON serialization
        platformStats: mapToObject(profile.platformStats),
        heatmapData: {
          overall: mapToObject(profile.heatmapData?.overall),
          byPlatform: Object.fromEntries(
            Object.entries(profile.heatmapData?.byPlatform || {})
              .map(([platform, data]) => [platform, mapToObject(data)])
          )
        },
        topicDistribution: {
          overall: mapToObject(profile.topicDistribution?.overall),
          byPlatform: Object.fromEntries(
            Object.entries(profile.topicDistribution?.byPlatform || {})
              .map(([platform, data]) => [platform, mapToObject(data)])
          )
        },
        languagesUsed: mapToObject(profile.languagesUsed)
      },
      submissions: {
        recent: recentSubmissions,
        total: totalSubmissions,
        accepted: acceptedSubmissions,
        unsolved: unsolvedProblems
      },
      ratingHistory: {
        overall: ratingHistory,
        byPlatform: ratingHistoryByPlatform
      },
      statistics: {
        ratingDistribution,
        contestStats,
        accountAge,
        accuracy: totalSubmissions > 0 ? ((acceptedSubmissions / totalSubmissions) * 100).toFixed(2) : 0
      }
    };

    res.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Get dashboard data for the authenticated user
 */
export async function getMyDashboard(req, res) {
  try {
    const user = await User.findById(req.user._id).select('username').lean();
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Reuse the existing function by setting the username in params
    req.params.username = user.username;
    return getDashboardByUsername(req, res);

  } catch (error) {
    console.error('Error fetching user dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Get dashboard analytics summary
 */
export async function getDashboardSummary(req, res) {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username }).select('_id').lean();
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const profile = await Profile.findOne({ user: user._id })
      .select('overallStats platformStats streaks linkedAccounts')
      .lean();

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Get quick statistics
    const summary = {
      totalSolved: profile.overallStats?.totalSolved || 0,
      currentStreak: profile.streaks?.currentStreak || 0,
      maxStreak: profile.streaks?.maxStreak || 0,
      platforms: profile.linkedAccounts?.length || 0,
      difficulty: profile.overallStats?.difficulty || {},
      platformStats: profile.platformStats || {}
    };

    res.json({
      success: true,
      data: summary
    });

  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard summary',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
