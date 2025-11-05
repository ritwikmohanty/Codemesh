import User from '../models/User.js';

/**
 * Search users by username or name
 */
export async function searchUsers(req, res) {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.json({
        success: true,
        data: []
      });
    }

    // Search for users matching the query (username or name)
    // Case-insensitive search
    const searchRegex = new RegExp(q.trim(), 'i');
    
    const users = await User.find({
      $or: [
        { username: searchRegex },
        { name: searchRegex }
      ]
    })
    .select('_id username name email avatarUrl onboardingCompleted')
    .limit(10) // Limit to 10 results
    .lean();

    res.json({
      success: true,
      data: users
    });

  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Get user by username (public profile preview)
 */
export async function getUserByUsername(req, res) {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username })
      .select('_id username name email avatarUrl bio onboardingCompleted')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
