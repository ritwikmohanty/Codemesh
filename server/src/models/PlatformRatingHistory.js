import mongoose from 'mongoose';

/**
 * Schema for storing raw platform-specific rating history
 * Maintains original platform rating data format
 */
const platformRatingHistorySchema = new mongoose.Schema({
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
  platformContestId: {
    type: String,
    required: true
  },
  // Raw rating change data as received from platform
  rawRatingData: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  // Quick access fields for common queries (platform-specific format)
  quickAccess: {
    contestName: { type: String, required: true },
    contestDate: { type: Date, required: true },
    oldRating: { type: Number, required: true },
    newRating: { type: Number, required: true },
    ratingChange: { type: Number, required: true },
    rank: { type: Number, default: null },
    // Platform-specific additional data
    platformSpecific: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for efficient queries
platformRatingHistorySchema.index({ user: 1, platform: 1 });
platformRatingHistorySchema.index({ platform: 1, platformContestId: 1, user: 1 }, { unique: true });
platformRatingHistorySchema.index({ user: 1, 'quickAccess.contestDate': -1 });
platformRatingHistorySchema.index({ platform: 1, 'quickAccess.contestDate': -1 });

export default mongoose.model('PlatformRatingHistory', platformRatingHistorySchema);