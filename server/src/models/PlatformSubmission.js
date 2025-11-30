import mongoose from 'mongoose';

/**
 * Schema for storing raw platform-specific submission data
 * Maintains original platform submission format without transformation
 */
const platformSubmissionSchema = new mongoose.Schema({
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
  platformSubmissionId: {
    type: String,
    required: true
  },
  // Raw submission data as received from platform
  rawSubmissionData: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  // Quick access fields for common queries (platform-specific format)
  quickAccess: {
    problemId: { type: String, required: true },
    problemName: { type: String, required: true },
    verdict: { type: String, required: true }, // Platform-specific verdict
    timestamp: { type: Date, required: true },
    language: { type: String, default: '' },
    // Platform-specific problem metadata
    problemData: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  // For linking to unified Problem model if needed
  unifiedProblem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for efficient queries
platformSubmissionSchema.index({ user: 1, platform: 1 });
// Changed: Include user in unique index to allow multiple users to sync same platform account
platformSubmissionSchema.index({ user: 1, platform: 1, platformSubmissionId: 1 }, { unique: true });
platformSubmissionSchema.index({ user: 1, 'quickAccess.timestamp': -1 });
platformSubmissionSchema.index({ 'quickAccess.verdict': 1 });
platformSubmissionSchema.index({ platform: 1, 'quickAccess.timestamp': -1 });

export default mongoose.model('PlatformSubmission', platformSubmissionSchema);