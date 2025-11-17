import './env.js';

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import User from '../models/User.js';

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/v1/auth/google/callback`,
  proxy: true
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('Google OAuth callback received for user:', profile.emails[0].value);
    
    // Check if user already exists with this Google ID
    let user = await User.findOne({ googleId: profile.id });
    
    if (user) {
      console.log('Existing Google user found:', user.email);
      return done(null, user);
    }

    // Check if user exists with same email
    user = await User.findOne({ email: profile.emails[0].value });
    
    if (user) {
      console.log('Linking Google account to existing user:', user.email);
      // Link Google account to existing user
      user.googleId = profile.id;
      user.authProvider = 'google';
      user.isEmailVerified = true;
      if (!user.avatarUrl && profile.photos[0]) {
        user.avatarUrl = profile.photos[0].value;
      }
      await user.save();
      return done(null, user);
    }

    // Generate temporary unique username from Google profile (will be updated during onboarding)
    let username = 'user_' + profile.id.slice(-8) + Math.floor(Math.random() * 1000);

    console.log('Creating new Google user:', profile.emails[0].value);
    
    // Create new user
    user = new User({
      googleId: profile.id,
      name: profile.displayName,
      email: profile.emails[0].value,
      username,
      authProvider: 'google',
      isEmailVerified: true,
      avatarUrl: profile.photos[0]?.value || null,
      onboardingCompleted: false // Ensure onboarding is required
    });

    await user.save();

    // Create associated records
    try {
      const [LeaderboardEntry, NotificationSetting] = await Promise.all([
        import('../models/LeaderboardEntry.js').then(m => m.default).catch(() => null),
        import('../models/NotificationSetting.js').then(m => m.default).catch(() => null)
      ]);

      const promises = [];
      if (LeaderboardEntry) promises.push(new LeaderboardEntry({ user: user._id }).save().catch(err => console.warn('LeaderboardEntry creation failed:', err.message)));
      if (NotificationSetting) promises.push(new NotificationSetting({ user: user._id }).save().catch(err => console.warn('NotificationSetting creation failed:', err.message)));

      if (promises.length > 0) {
        await Promise.allSettled(promises);
      }
    } catch (modelError) {
      console.warn('Could not create associated records:', modelError.message);
    }

    console.log('Google user created successfully:', user.email);
    return done(null, user);
  } catch (error) {
    console.error('Google OAuth error:', error);
    return done(error, null);
  }
}));

// JWT Strategy
passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
}, async (payload, done) => {
  try {
    const user = await User.findById(payload.userId).select('-password');
    if (user) {
      return done(null, user);
    }
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
}));

export default passport;
