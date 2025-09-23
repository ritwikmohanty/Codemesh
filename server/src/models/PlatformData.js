import mongoose from 'mongoose';

/**
 * Schema for storing raw platform-specific user data
 * This stores data exactly as received from each platform without any transformation
 */
const platformDataSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  platform: {
    type: String,
    required: true,
    enum: ['codeforces', 'leetcode', 'codechef', 'hackerrank', 'atcoder', 'geeksforgeeks', 'code360', 'hackerearth']
  },
  handle: {
    type: String,
    required: true
  },
  // Raw platform data - stored as-is from platform API
  rawData: {
    // User profile data from platform
    profile: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    // Platform-specific statistics
    statistics: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    // Any additional platform-specific metadata
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  // Quick access fields for common data (still platform-specific format)
  quickAccess: {
    currentRating: { type: Number, default: null },
    maxRating: { type: Number, default: null },
    rank: { type: String, default: '' },
    totalSolved: { type: Number, default: 0 },
    profileUrl: { type: String, default: '' },
    avatarUrl: { type: String, default: '' }
  },
  lastSynced: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index for user-platform uniqueness
platformDataSchema.index({ user: 1, platform: 1 }, { unique: true });
platformDataSchema.index({ platform: 1 });
platformDataSchema.index({ handle: 1, platform: 1 });
platformDataSchema.index({ lastSynced: -1 });

export default mongoose.model('PlatformData', platformDataSchema);