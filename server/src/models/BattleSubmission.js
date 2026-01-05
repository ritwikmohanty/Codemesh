import mongoose from 'mongoose';

/**
 * Battle Submission Schema
 * Tracks submissions made during a battle
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
  // Codeforces submission ID
  cfSubmissionId: {
    type: String,
    required: true
  },
  contestId: {
    type: Number,
    required: true
  },
  problemIndex: {
    type: String,
    required: true
  },
  verdict: {
    type: String,
    required: true,
    enum: [
      'OK',
      'WRONG_ANSWER',
      'TIME_LIMIT_EXCEEDED',
      'MEMORY_LIMIT_EXCEEDED',
      'RUNTIME_ERROR',
      'COMPILATION_ERROR',
      'PRESENTATION_ERROR',
      'IDLENESS_LIMIT_EXCEEDED',
      'SECURITY_VIOLATED',
      'CRASHED',
      'SKIPPED',
      'CHALLENGED',
      'PARTIAL',
      'TESTING'
    ]
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
  // Raw submission data from Codeforces
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
battleSubmissionSchema.index({ battle: 1, contestId: 1, problemIndex: 1 });
battleSubmissionSchema.index({ cfSubmissionId: 1 }, { unique: true });

// Method to check if submission is accepted
battleSubmissionSchema.methods.isAccepted = function() {
  return this.verdict === 'OK';
};

export default mongoose.model('BattleSubmission', battleSubmissionSchema);
