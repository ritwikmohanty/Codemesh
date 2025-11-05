import './config/env.js';

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";
import cookieParser from "cookie-parser";

// Import models to register them with Mongoose
import './models/User.js';
import './models/Contest.js';
import './models/PlatformData.js';
import './models/PlatformSubmission.js';
import './models/PlatformRatingHistory.js';

// Import passport AFTER dotenv.config()
import passport from "./config/passport.js";

// Import routes
import authRoutes from './routes/authRoutes.js';
import contestRoutes from './routes/contestRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import portfolioRoutes from './routes/portfolioRoutes.js';
import platformRoutes from './routes/platformRoutes.js';
import leaderboardRoutes from './routes/leaderboardRoutes.js';
import onboardingRoutes from './routes/onboardingRoutes.js';
import userRoutes from './routes/userRoutes.js';

// Import schedulers
import { startContestScheduler } from './schedulers/contestScheduler.js';
import { startNotificationScheduler } from './schedulers/notificationScheduler.js';
import { startLeaderboardScheduler } from './schedulers/leaderboardScheduler.js';

const app = express();

// Validate required environment variables
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.error('Missing required Google OAuth environment variables');
  console.error('Please ensure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set in .env file');
  process.exit(1);
}

// Middlewares
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Session configuration for Passport and notifications
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
  resave: false,
  saveUninitialized: true, // Create sessions for anonymous users
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    touchAfter: 24 * 3600 // lazy session update
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Passport serialization
passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await mongoose.model('User').findById(id).select('-password');
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Routes
app.get("/", (req, res) => {
  res.send("API running...");
});

// API routes
try {
  app.use('/api/v1', authRoutes);
  app.use('/api/v1', contestRoutes);
  app.use('/api/v1', notificationRoutes);
  app.use('/api/v1', portfolioRoutes);
  app.use('/api/v1', platformRoutes);
  app.use('/api/v1', leaderboardRoutes);
  app.use('/api/v1', onboardingRoutes);
  app.use('/api/v1', userRoutes);
} catch (routeErr) {
  console.error('Route registration error:', routeErr);
  throw routeErr;
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Connect DB and Start Server
const PORT = process.env.PORT || 3000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      // Start schedulers after server is running
      startContestScheduler();
      startNotificationScheduler();
      startLeaderboardScheduler();
    });
  })
  .catch(err => console.error("MongoDB connection error:", err));
