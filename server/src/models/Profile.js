import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  codeMeshRating: {
    type: Number,
    default: 0
  },
  linkedAccounts: [{
    platform: {
      type: String,
      required: true,
      enum: ['codeforces', 'leetcode', 'codechef', 'hackerrank', 'atcoder', 'geeksforgeeks', 'code360', 'hackerearth']
    },
    handle: {
      type: String,
      required: true
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    rating: {
      type: Number,
      default: 0
    },
    maxRating: {
      type: Number,
      default: 0
    },
    rank: {
      type: String,
      default: ''
    },
    stars: {
      type: Number,
      default: 0
    },
    totalSolved: {
      type: Number,
      default: 0
    },
    lastSynced: {
      type: Date,
      default: Date.now
    }
  }],
  overallStats: {
    totalSolved: { type: Number, default: 0 },
    cpSolved: { type: Number, default: 0 },
    dsaSolved: { type: Number, default: 0 },
    fundamentalsSolved: { type: Number, default: 0 },
    difficulty: {
      easy: { type: Number, default: 0 },
      medium: { type: Number, default: 0 },
      hard: { type: Number, default: 0 },
      expert: { type: Number, default: 0 }
    },
    accuracy: { type: Number, default: 0 },
    averageAttempts: { type: Number, default: 0 }
  },
  platformStats: {
    type: Map,
    of: {
      totalSolved: { type: Number, default: 0 },
      difficulty: {
        easy: { type: Number, default: 0 },
        medium: { type: Number, default: 0 },
        hard: { type: Number, default: 0 },
        expert: { type: Number, default: 0 }
      },
      accuracy: { type: Number, default: 0 },
      averageAttempts: { type: Number, default: 0 }
    },
    default: {}
  },
  streaks: {
    currentStreak: { type: Number, default: 0 },
    maxStreak: { type: Number, default: 0 },
    activeDays: { type: Number, default: 0 }
  },
  heatmapData: {
    overall: {
      type: Map,
      of: Number,
      default: {}
    },
    byPlatform: {
      type: Map,
      of: {
        type: Map,
        of: Number
      },
      default: {}
    }
  },
  topicDistribution: {
    overall: {
      type: Map,
      of: Number,
      default: {}
    },
    byPlatform: {
      type: Map,
      of: {
        type: Map,
        of: Number
      },
      default: {}
    }
  },
  languagesUsed: {
    type: Map,
    of: Number,
    default: {}
  },
  badges: [{
    name: String,
    description: String,
    iconUrl: String,
    earnedAt: { type: Date, default: Date.now }
  }],
  recentSubmissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Submission'
  }],
  lastRefresh: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

profileSchema.index({ codeMeshRating: -1 });
profileSchema.index({ 'linkedAccounts.platform': 1 });
profileSchema.index({ 'overallStats.totalSolved': -1 });

export default mongoose.model('Profile', profileSchema);
