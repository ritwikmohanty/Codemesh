import express from 'express';
import webpush from 'web-push';
import NotificationSetting from '../models/NotificationSetting.js';
import Contest from '../models/Contest.js';
import { authenticateToken, optionalAuth } from '../middlewares/auth.js';

const router = express.Router();

// Configure web-push with VAPID keys
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:admin@codemesh.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

// Enhanced auth middleware that handles both authenticated and anonymous users
const enhancedOptionalAuth = async (req, res, next) => {
  try {
    // First try to get authenticated user from cookie, then Authorization header
    const token = req.cookies?.authToken || 
                  (req.headers['authorization'] && req.headers['authorization'].split(' ')[1]);

    if (token) {
      try {
        const jwt = await import('jsonwebtoken');
        const User = await import('../models/User.js');
        
        const decoded = jwt.default.verify(token, process.env.JWT_SECRET);
        const user = await User.default.findById(decoded.userId).select('-password');
        
        if (user) {
          req.user = user;
          req.userId = user._id.toString();
          req.isAuthenticated = true;
          return next();
        }
      } catch (error) {
        console.log('Token verification failed:', error.message);
      }
    }

    // Fallback to session-based identification for anonymous users
    if (!req.sessionID) {
      req.userId = `anonymous_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    } else {
      req.userId = `session_${req.sessionID}`;
    }
    req.isAuthenticated = false;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    req.userId = `fallback_${Date.now()}`;
    req.isAuthenticated = false;
    next();
  }
};

// Get VAPID public key for frontend
router.get('/notifications/vapid-public-key', (req, res) => {
  res.json({
    success: true,
    publicKey: process.env.VAPID_PUBLIC_KEY
  });
});

// Save notification preferences
router.post('/notifications/preferences', enhancedOptionalAuth, async (req, res) => {
  try {
    console.log('User authenticated:', req.isAuthenticated);
    console.log('User ID:', req.userId);
    console.log('User object:', req.user ? { id: req.user._id, name: req.user.name, username: req.user.username } : 'No user');
    console.log('Saving notification preferences:', req.body);
    
    const {
      enabled,
      methods,
      platforms,
      difficulties,
      durations,
      reminderTime,
      customTime,
      customUnit,
      userName,
      userHandle,
      personalizedMessages,
      pushSubscription,
      timezone
    } = req.body;

    // Calculate reminder time in minutes
    let reminderMinutes = parseInt(reminderTime) || 60;
    if (reminderTime === 'custom' && customTime) {
      const time = parseInt(customTime);
      switch (customUnit) {
        case 'hours':
          reminderMinutes = time * 60;
          break;
        case 'days':
          reminderMinutes = time * 24 * 60;
          break;
        default:
          reminderMinutes = time;
      }
    }

    const userId = req.userId;

    const notificationData = {
      enabled: enabled !== undefined ? enabled : true,
      methods: methods || ['push'],
      platforms: platforms && platforms.length > 0 ? platforms : ['all'],
      difficulties: difficulties && difficulties.length > 0 ? difficulties : ['all'],
      durations: durations && durations.length > 0 ? durations : ['all'],
      reminderTime: reminderMinutes,
      personalizedMessages: personalizedMessages !== undefined ? personalizedMessages : true,
      timezone: timezone || 'UTC'
    };

    // For authenticated users, use their name/handle from user object
    // For anonymous users, use the provided values
    if (req.isAuthenticated && req.user) {
      notificationData.userName = req.user.name || '';
      notificationData.userHandle = req.user.username || '';
    } else {
      notificationData.userName = userName || '';
      notificationData.userHandle = userHandle || '';
    }

    // Add push subscription if provided
    if (pushSubscription && methods && methods.includes('push')) {
      notificationData.pushSubscription = pushSubscription;
    }

    // For authenticated users, use the user field; for anonymous users, use userId field
    if (req.isAuthenticated) {
      notificationData.user = req.user._id;
      notificationData.userId = null; // Clear userId field for authenticated users
    } else {
      notificationData.userId = userId;
      notificationData.user = null; // Clear user field for anonymous users
    }

    console.log('Notification data to save:', notificationData);

    // Find existing preference
    let preference;
    if (req.isAuthenticated) {
      preference = await NotificationSetting.findOne({ user: req.user._id });
    } else {
      preference = await NotificationSetting.findOne({ userId: userId });
    }
    
    if (preference) {
      // Update existing preference
      Object.assign(preference, notificationData);
      preference = await preference.save();
      console.log('Updated existing preference:', preference);
    } else {
      // Create new preference
      preference = new NotificationSetting(notificationData);
      preference = await preference.save();
      console.log('Created new preference:', preference);
    }

    res.json({
      success: true,
      message: 'Notification preferences saved successfully',
      data: preference
    });
  } catch (error) {
    console.error('Error saving notification preferences:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to save notification preferences',
      error: error.message
    });
  }
});

// Get notification preferences
router.get('/notifications/preferences', enhancedOptionalAuth, async (req, res) => {
  try {
    const userId = req.userId;
    console.log('Getting preferences for userId:', userId);
    console.log('Is authenticated:', req.isAuthenticated);
    
    let preference;
    if (req.isAuthenticated) {
      preference = await NotificationSetting.findOne({ user: req.user._id });
    } else {
      preference = await NotificationSetting.findOne({ userId: userId });
    }
    
    if (!preference) {
      return res.json({
        success: true,
        data: null
      });
    }

    res.json({
      success: true,
      data: preference
    });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification preferences',
      error: error.message
    });
  }
});

// Subscribe to push notifications
router.post('/notifications/subscribe', enhancedOptionalAuth, async (req, res) => {
  try {
    const { subscription } = req.body;

    // Find or create notification setting
    let preference;
    if (req.isAuthenticated) {
      preference = await NotificationSetting.findOneAndUpdate(
        { user: req.user._id },
        { 
          pushSubscription: subscription,
          $addToSet: { methods: 'push' }
        },
        { upsert: true, new: true }
      );
    } else {
      preference = await NotificationSetting.findOneAndUpdate(
        { userId: req.userId },
        { 
          pushSubscription: subscription,
          $addToSet: { methods: 'push' }
        },
        { upsert: true, new: true }
      );
    }

    res.json({
      success: true,
      message: 'Push notification subscription saved',
      data: preference
    });
  } catch (error) {
    console.error('Error saving push subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save push subscription',
      error: error.message
    });
  }
});

// Test notification endpoint
router.post('/notifications/test', enhancedOptionalAuth, async (req, res) => {
  try {
    console.log('Testing notification for userId:', req.userId);
    console.log('Is authenticated:', req.isAuthenticated);
    
    let preference;
    if (req.isAuthenticated) {
      preference = await NotificationSetting.findOne({ user: req.user._id });
    } else {
      preference = await NotificationSetting.findOne({ userId: req.userId });
    }
    
    if (!preference || !preference.pushSubscription) {
      return res.status(400).json({
        success: false,
        message: 'No push subscription found. Please save your notification preferences first.'
      });
    }

    console.log('Found preference for test:', preference);

    const payload = JSON.stringify({
      title: 'Test Notification',
      body: preference.personalizedMessages && preference.userName 
        ? `Hey ${preference.userName}, this is a test notification from CodeMesh!`
        : 'This is a test notification from CodeMesh!',
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      data: {
        url: '/calendar'
      }
    });

    await webpush.sendNotification(preference.pushSubscription, payload);

    res.json({
      success: true,
      message: 'Test notification sent successfully'
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test notification',
      error: error.message
    });
  }
});

// Clear all notification data (for debugging)
router.delete('/notifications/clear', async (req, res) => {
  try {
    await NotificationSetting.deleteMany({});
    res.json({
      success: true,
      message: 'All notification settings cleared'
    });
  } catch (error) {
    console.error('Error clearing notification settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear notification settings',
      error: error.message
    });
  }
});

export default router;
