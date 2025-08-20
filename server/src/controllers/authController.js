import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import User from '../models/User.js';
import Profile from '../models/Profile.js';
import LeaderboardEntry from '../models/LeaderboardEntry.js';
import NotificationSetting from '../models/NotificationSetting.js';

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

const generateUsername = (name) => {
  // Convert name to lowercase, remove spaces and special characters
  let username = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Add random number if username is too short
  if (username.length < 3) {
    username += Math.floor(Math.random() * 1000);
  }
  
  return username;
};

const setCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/'
};

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: 'Name, email, and password are required' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters long' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User with this email already exists' 
      });
    }

    // Generate unique username
    let username = generateUsername(name);
    let isUsernameUnique = false;
    let attempts = 0;

    while (!isUsernameUnique && attempts < 10) {
      const existingUsername = await User.findOne({ username });
      if (!existingUsername) {
        isUsernameUnique = true;
      } else {
        username = generateUsername(name) + Math.floor(Math.random() * 1000);
        attempts++;
      }
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      username,
      password: hashedPassword
    });

    await user.save();

    // Create associated records
    await Promise.all([
      new Profile({ user: user._id }).save(),
      new LeaderboardEntry({ user: user._id }).save(),
      new NotificationSetting({ user: user._id }).save()
    ]);

    // Generate token and set as HTTP-only cookie
    const token = generateToken(user._id);
    res.cookie('authToken', token, setCookieOptions);

    // Return user data without password
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      avatarUrl: user.avatarUrl,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt
    };

    res.status(201).json({
      message: 'User created successfully',
      user: userData
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email and password are required' 
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid email or password' 
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: 'Invalid email or password' 
      });
    }

    // Generate token and set as HTTP-only cookie
    const token = generateToken(user._id);
    res.cookie('authToken', token, setCookieOptions);

    // Return user data without password
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      avatarUrl: user.avatarUrl,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt
    };

    res.json({
      message: 'Login successful',
      user: userData
    });

  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const userData = {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      username: req.user.username,
      avatarUrl: req.user.avatarUrl,
      isEmailVerified: req.user.isEmailVerified,
      createdAt: req.user.createdAt
    };

    res.json({ user: userData });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const newToken = generateToken(req.user._id);
    res.cookie('authToken', newToken, setCookieOptions);
    res.json({ message: 'Token refreshed successfully' });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Google OAuth initiate
export const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email']
});

// Google OAuth callback
export const googleCallback = (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, user, info) => {
    if (err) {
      console.error('Google OAuth error:', err);
      return res.redirect(`${process.env.CLIENT_URL}?error=oauth_error`);
    }
    
    if (!user) {
      return res.redirect(`${process.env.CLIENT_URL}?error=oauth_failed`);
    }

    // Generate JWT token and set as HTTP-only cookie
    const token = generateToken(user._id);
    res.cookie('authToken', token, setCookieOptions);
    
    // Redirect to frontend with success flag
    res.redirect(`${process.env.CLIENT_URL}?success=oauth_success`);
  })(req, res, next);
};

// Add logout endpoint
export const logout = (req, res) => {
  res.clearCookie('authToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/'
  });
  res.json({ message: 'Logged out successfully' });
};

// Get user data for OAuth success
export const getOAuthUser = async (req, res) => {
  try {
    const userData = {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      username: req.user.username,
      avatarUrl: req.user.avatarUrl,
      isEmailVerified: req.user.isEmailVerified,
      authProvider: req.user.authProvider,
      createdAt: req.user.createdAt
    };

    res.json({ user: userData });
  } catch (error) {
    console.error('Get OAuth user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
