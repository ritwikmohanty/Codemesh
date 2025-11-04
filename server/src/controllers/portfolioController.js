import UnificationService from '../services/unificationService.js';
import User from '../models/User.js';

const unificationService = new UnificationService();

/**
 * Portfolio Controller - Handles unified portfolio views
 * Provides unified statistics across all platforms for a user
 */

/**
 * Get unified portfolio for authenticated user
 */
export async function getMyPortfolio(req, res) {
  try {
    const userId = req.user._id;

    const portfolioData = await unificationService.getUnifiedPortfolio(userId);
    
    // Add user information
    const user = await User.findById(userId)
      .select('username name email avatarUrl bio onboarding socials')
      .lean();

    res.json({
      success: true,
      data: {
        user,
        portfolio: portfolioData
      }
    });

  } catch (error) {
    console.error('Error fetching user portfolio:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch portfolio data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Get unified portfolio by username (public)
 */
export async function getPortfolioByUsername(req, res) {
  try {
    const { username } = req.params;

    // Find user
    const user = await User.findOne({ username })
      .select('username name email avatarUrl bio onboarding socials profileViews')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Increment profile views (for public profiles)
    await User.findByIdAndUpdate(user._id, { $inc: { profileViews: 1 } });

    const portfolioData = await unificationService.getUnifiedPortfolio(user._id);

    res.json({
      success: true,
      data: {
        user: {
          ...user,
          profileViews: user.profileViews + 1
        },
        portfolio: portfolioData
      }
    });

  } catch (error) {
    console.error('Error fetching portfolio by username:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch portfolio data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Get portfolio summary with key metrics
 */
export async function getPortfolioSummary(req, res) {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username })
      .select('username name avatarUrl')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const portfolioData = await unificationService.getUnifiedPortfolio(user._id);

    // Create summary with key metrics
    const summary = {
      user: {
        username: user.username,
        name: user.name,
        avatarUrl: user.avatarUrl
      },
      metrics: {
        totalProblemsSolved: portfolioData.overallStats.totalSolved,
        codeMeshRating: portfolioData.codeMeshRating,
        platformsLinked: portfolioData.linkedAccounts.length,
        currentStreak: portfolioData.activityData.streaks.current,
        longestStreak: portfolioData.activityData.streaks.longest,
        acceptanceRate: portfolioData.overallStats.acceptanceRate,
        badgesEarned: portfolioData.badges.length
      },
      platforms: portfolioData.linkedAccounts.map(account => ({
        platform: account.platform,
        handle: account.handle,
        rating: account.rating,
        solved: account.totalSolved
      })),
      topTopics: Object.entries(portfolioData.topicDistribution)
        .slice(0, 5)
        .map(([topic, count]) => ({ topic, count })),
      recentActivity: portfolioData.activityData.streaks.active
    };

    res.json({
      success: true,
      data: summary
    });

  } catch (error) {
    console.error('Error fetching portfolio summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch portfolio summary',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}