import mongoose from 'mongoose';

/**
 * Battle Submission Schema
 * Tracks submissions made during a battle (supports both Codeforces and LeetCode)
 */
const battleSubmissionSchema = new mongoose.Schema({
  battle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Battle',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Platform identifier
  platform: {
    type: String,
    enum: ['codeforces', 'leetcode'],
    required: true
  },
  // Unique submission ID (CF ID or LC timestamp+slug)
  submissionId: {
    type: String,
    required: true
  },
  // Codeforces-specific fields
  cfSubmissionId: {
    type: String,
    default: null
  },
  contestId: {
    type: Number,
    default: null
  },
  problemIndex: {
    type: String,
    default: null
  },
  // LeetCode-specific fields
  titleSlug: {
    type: String,
    default: null
  },
  // Common fields
  verdict: {
    type: String,
    required: true
  },
  passedTestCount: {
    type: Number,
    default: 0
  },
  programmingLanguage: {
    type: String,
    default: ''
  },
  submittedAt: {
    type: Date,
    required: true
  },
  // Raw submission data from API
  rawData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for efficient queries
battleSubmissionSchema.index({ battle: 1, user: 1 });
battleSubmissionSchema.index({ battle: 1, platform: 1 });
battleSubmissionSchema.index({ battle: 1, contestId: 1, problemIndex: 1 });
battleSubmissionSchema.index({ battle: 1, titleSlug: 1 });
battleSubmissionSchema.index({ submissionId: 1, battle: 1 }, { unique: true });

// Method to check if submission is accepted
battleSubmissionSchema.methods.isAccepted = function() {
  if (this.platform === 'codeforces') {
    return this.verdict === 'OK';
  } else if (this.platform === 'leetcode') {
    return this.verdict === 'Accepted';
  }
  return false;
};

export default mongoose.model('BattleSubmission', battleSubmissionSchema);
