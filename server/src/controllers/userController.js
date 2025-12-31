import User from '../models/User.js';
import PlatformData from '../models/PlatformData.js';
import bcrypt from 'bcrypt';

/**
 * Get linked platforms for authenticated user
 */
export async function getLinkedPlatforms(req, res) {
  try {
    const userId = req.user._id;

    const platformData = await PlatformData.find({ user: userId, isActive: true })
      .select('platform handle quickAccess lastSynced isVerified verifiedAt')
      .lean();

    const linkedPlatforms = platformData.map(platform => ({
      platform: platform.platform,
      handle: platform.handle,
      rating: platform.quickAccess.currentRating || 0,
      maxRating: platform.quickAccess.maxRating || 0,
      rank: platform.quickAccess.rank || '',
      totalSolved: platform.quickAccess.totalSolved || 0,
      profileUrl: platform.quickAccess.profileUrl || '',
      lastSynced: platform.lastSynced,
      isVerified: platform.isVerified || false,
      verifiedAt: platform.verifiedAt || null
    }));

    res.json({
      success: true,
      data: linkedPlatforms
    });

  } catch (error) {
    console.error('Error fetching linked platforms:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch linked platforms',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

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

/**
 * Update user profile information
 */
export async function updateProfile(req, res) {
  try {
    const userId = req.user._id;
    const { name, bio, avatarUrl } = req.body;

    // Validate input
    if (name && name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Name cannot be empty'
      });
    }

    if (name && name.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Name must be less than 50 characters'
      });
    }

    if (bio && bio.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Bio must be less than 500 characters'
      });
    }

    // Build update object
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (bio !== undefined) updateData.bio = bio.trim();
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;

    // Update user
    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Update user social links
 */
export async function updateSocials(req, res) {
  try {
    const userId = req.user._id;
    const { github, linkedin, twitter, website } = req.body;

    // Build socials object
    const socials = {};
    if (github !== undefined) socials.github = github.trim();
    if (linkedin !== undefined) socials.linkedin = linkedin.trim();
    if (twitter !== undefined) socials.twitter = twitter.trim();
    if (website !== undefined) socials.website = website.trim();

    // Update user
    const user = await User.findByIdAndUpdate(
      userId,
      { socials },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Social links updated successfully',
      user
    });

  } catch (error) {
    console.error('Error updating socials:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update social links',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Change user password
 */
export async function changePassword(req, res) {
  try {
    const userId = req.user._id;
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Get user with password
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user has a password (not OAuth user)
    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: 'Password change is not available for OAuth users'
      });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
