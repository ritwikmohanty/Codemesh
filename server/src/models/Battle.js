import mongoose from 'mongoose';

/**
 * Battle Schema
 * Represents a competitive programming battle between users
 */
const battleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  startTime: {
    type: Date,
    required: true
  },
  durationMinutes: {
    type: Number,
    required: true,
    min: 10,
    max: 300
  },
  // Platforms included in this battle
  platforms: [{
    type: String,
    enum: ['codeforces', 'leetcode'],
    default: 'codeforces'
  }],
  // Codeforces-specific settings
  minRating: {
    type: Number,
    min: 800,
    max: 3500,
    default: 800
  },
  maxRating: {
    type: Number,
    min: 800,
    max: 3500,
    default: 1400
  },
  // LeetCode-specific settings
  leetcodeDifficulty: [{
    type: String,
    enum: ['Easy', 'Medium', 'Hard']
  }],
  numProblems: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  // Track problems per platform
  problemsPerPlatform: {
    codeforces: { type: Number, default: 0 },
    leetcode: { type: Number, default: 0 }
  },
  joinToken: {
    type: String,
    required: true,
    unique: true
  },
  // Participants are stored as subdocuments for efficient querying
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    codeforcesHandle: {
      type: String,
      default: null
    },
    leetcodeHandle: {
      type: String,
      default: null
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Problems selected for this battle (supports both platforms)
  problems: [{
    // Common fields
    platform: {
      type: String,
      enum: ['codeforces', 'leetcode'],
      required: true
    },
    name: {
      type: String,
      default: ''
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    // Codeforces-specific fields
    contestId: {
      type: Number,
      default: null
    },
    index: {
      type: String,
      default: null
    },
    rating: {
      type: Number,
      default: null
    },
    // LeetCode-specific fields
    titleSlug: {
      type: String,
      default: null
    },
    title: {
      type: String,
      default: null
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard', null],
      default: null
    },
    frontendId: {
      type: String,
      default: null
    }
  }],
  // Cache last known submission timestamps for efficient polling
  lastSubmissionCache: {
    type: Map,
    of: {
      codeforces: { type: Number, default: 0 },
      leetcode: { type: Number, default: 0 }
    },
    default: new Map()
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  endedAt: {
    type: Date,
    default: null
  }
});

// Index for efficient queries
battleSchema.index({ status: 1, startTime: 1 });
battleSchema.index({ 'participants.user': 1 });
battleSchema.index({ createdBy: 1 });
battleSchema.index({ joinToken: 1 }, { unique: true });

// Virtual for end time
battleSchema.virtual('endTime').get(function() {
  if (!this.startTime || !this.durationMinutes) return null;
  return new Date(this.startTime.getTime() + this.durationMinutes * 60 * 1000);
});

// Method to check if user is participant
battleSchema.methods.isParticipant = function(userId) {
  return this.participants.some(p => p.user.toString() === userId.toString());
};

// Method to check if user is creator
battleSchema.methods.isCreator = function(userId) {
  return this.createdBy.toString() === userId.toString();
};

// Method to check if battle has started
battleSchema.methods.hasStarted = function() {
  return this.status !== 'pending';
};

// Method to check if battle is in progress
battleSchema.methods.isInProgress = function() {
  return this.status === 'in_progress';
};

// Method to check if battle is completed
battleSchema.methods.isCompleted = function() {
  return this.status === 'completed';
};

// Ensure virtuals are included when converting to JSON
battleSchema.set('toJSON', { virtuals: true });
battleSchema.set('toObject', { virtuals: true });

export default mongoose.model('Battle', battleSchema);
