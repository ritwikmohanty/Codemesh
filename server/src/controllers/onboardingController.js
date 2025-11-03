import User from '../models/User.js';

export const getOnboardingStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('onboardingCompleted onboarding username name email');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      onboardingCompleted: user.onboardingCompleted,
      onboarding: user.onboarding,
      user: {
        name: user.name,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Get onboarding status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get onboarding status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const completeOnboarding = async (req, res) => {
  try {
    const { username, country, degree, institution, branch, status, graduationYear } = req.body;

    // Validation
    if (!username || !country || !degree || !institution || !graduationYear) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check if username is already taken (excluding current user)
    const existingUser = await User.findOne({ 
      username: username.toLowerCase(), 
      _id: { $ne: req.user._id } 
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username is already taken'
      });
    }

    // Validate branch requirement
    const degreesRequiringBranch = ['bachelor', 'master', 'phd'];
    if (degreesRequiringBranch.includes(degree.toLowerCase()) && !branch) {
      return res.status(400).json({
        success: false,
        message: 'Branch is required for this degree'
      });
    }

    // Update user
    const user = await User.findById(req.user._id);
    
    user.username = username.toLowerCase().trim();
    user.onboarding = {
      country: country.trim(),
      degree: degree.trim(),
      institution: institution.trim(),
      branch: branch ? branch.trim() : '',
      status: status || 'current',
      graduationYear: parseInt(graduationYear)
    };
    user.onboardingCompleted = true;

    await user.save();

    res.json({
      success: true,
      message: 'Onboarding completed successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        onboardingCompleted: user.onboardingCompleted
      }
    });

  } catch (error) {
    console.error('Complete onboarding error:', error);
    
    // Handle duplicate username error
    if (error.code === 11000 && error.keyPattern?.username) {
      return res.status(400).json({
        success: false,
        message: 'Username is already taken'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to complete onboarding',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const checkUsernameAvailability = async (req, res) => {
  try {
    const { username } = req.query;

    if (!username || username.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Username must be at least 3 characters'
      });
    }

    const existingUser = await User.findOne({ 
      username: username.toLowerCase(),
      _id: { $ne: req.user._id }
    });

    res.json({
      success: true,
      available: !existingUser
    });

  } catch (error) {
    console.error('Check username availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check username availability',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
