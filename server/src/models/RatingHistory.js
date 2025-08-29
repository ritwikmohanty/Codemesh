import mongoose from 'mongoose';

const ratingHistorySchema = new mongoose.Schema({
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
  contest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contest',
    required: true
  },
  contestIdOnPlatform: {
    type: String,
    required: true
  },
  contestName: {
    type: String,
    required: true,
    trim: true
  },
  handle: {
    type: String,
    required: true
  },
  rank: {
    type: Number,
    required: true
  },
  oldRating: {
    type: Number,
    required: true
  },
  newRating: {
    type: Number,
    required: true
  },
  ratingChange: {
    type: Number,
    required: true
  },
  problemsSolved: {
    type: Number,
    default: 0
  },
  penalty: {
    type: Number,
    default: 0
  },
  maxRating: {
    type: Number,
    default: null
  },
  newMaxRating: {
    type: Number,
    default: null
  },
  rankTitle: {
    type: String,
    default: ''
  },
  contestTimestamp: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

ratingHistorySchema.index({ user: 1, platform: 1, contestTimestamp: -1 });
ratingHistorySchema.index({ user: 1, platform: 1, contestIdOnPlatform: 1 }, { unique: true });
ratingHistorySchema.index({ platform: 1, contestTimestamp: -1 });
ratingHistorySchema.index({ newRating: -1 });
ratingHistorySchema.index({ ratingChange: -1 });

export default mongoose.model('RatingHistory', ratingHistorySchema);
