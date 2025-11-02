import mongoose from 'mongoose';

const leaderboardEntrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // CodeMesh Master Rating (Primary leaderboard metric)
  masterRating: {
    type: Number,
    default: 0,
    index: true
  },
  
  // Rating breakdown for transparency
  ratingBreakdown: {
    coreRating: { type: Number, default: 0 },
    contestBonus: { type: Number, default: 0 },
    accuracyBonus: { type: Number, default: 0 },
    practiceBonus: { type: Number, default: 0 }
  },
  
  // Components used in calculation (for display and debugging)
  ratingComponents: {
    platformRatings: [{
      platform: String,
      rating: Number,
      normalized: Number
    }],
    totalContests: { type: Number, default: 0 },
    acceptanceRate: { type: Number, default: 0 },
    totalSolved: { type: Number, default: 0 }
  },
  
  // Legacy scores (kept for backward compatibility)
  globalScore: {
    type: Number,
    default: 0
  },
  monthlyScore: {
    type: Number,
    default: 0
  },
  weeklyScore: {
    type: Number,
    default: 0
  },
  
  // Activity tracking
  lastProblemSolvedAt: {
    type: Date,
    default: null
  },
  lastRatingUpdate: {
    type: Date,
    default: Date.now
  },
  
  // Rank tracking (updated periodically)
  currentRank: {
    type: Number,
    default: null
  },
  previousRank: {
    type: Number,
    default: null
  },
  rankChange: {
    type: Number,
    default: 0
  },
  
  // Badge tier based on master rating
  tier: {
    type: String,
    enum: ['Newbie', 'Pupil', 'Specialist', 'Expert', 'Candidate Master', 'Master', 'Grandmaster', 'Legendary Grandmaster'],
    default: 'Newbie'
  },
  
  // Performance metrics
  performanceMetrics: {
    peakRating: { type: Number, default: 0 },
    peakRatingDate: { type: Date, default: null },
    ratingGrowth30d: { type: Number, default: 0 },
    ratingGrowth90d: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Indexes for efficient leaderboard queries
leaderboardEntrySchema.index({ masterRating: -1 });
leaderboardEntrySchema.index({ masterRating: -1, lastRatingUpdate: -1 });
leaderboardEntrySchema.index({ tier: 1, masterRating: -1 });
leaderboardEntrySchema.index({ globalScore: -1 });
leaderboardEntrySchema.index({ monthlyScore: -1 });
leaderboardEntrySchema.index({ weeklyScore: -1 });

// Method to determine tier based on master rating
leaderboardEntrySchema.methods.updateTier = function() {
  const rating = this.masterRating;
  
  if (rating < 1000) {
    this.tier = 'Newbie';
  } else if (rating < 1400) {
    this.tier = 'Pupil';
  } else if (rating < 1800) {
    this.tier = 'Specialist';
  } else if (rating < 2200) {
    this.tier = 'Expert';
  } else if (rating < 2600) {
    this.tier = 'Candidate Master';
  } else if (rating < 3000) {
    this.tier = 'Master';
  } else if (rating < 3500) {
    this.tier = 'Grandmaster';
  } else {
    this.tier = 'Legendary Grandmaster';
  }
};

// Method to update rank change
leaderboardEntrySchema.methods.updateRankChange = function(newRank) {
  if (this.currentRank) {
    this.previousRank = this.currentRank;
    this.rankChange = this.previousRank - newRank; // Positive = moved up
  }
  this.currentRank = newRank;
};

export default mongoose.model('LeaderboardEntry', leaderboardEntrySchema);
