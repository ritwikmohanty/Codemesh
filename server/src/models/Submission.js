import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
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
  submissionIdOnPlatform: {
    type: String,
    required: true
  },
  problem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true
  },
  problemIdOnPlatform: {
    type: String,
    required: true
  },
  problemName: {
    type: String,
    required: true
  },
  verdict: {
    type: String,
    required: true,
    enum: ['Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Memory Limit Exceeded', 'Runtime Error', 'Compilation Error', 'Presentation Error', 'Partial', 'Skipped']
  },
  language: {
    type: String,
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard', 'Expert']
  },
  difficultyRating: {
    type: Number,
    default: null
  },
  category: {
    type: String,
    enum: ['CP', 'DSA', 'Fundamentals'],
    default: 'DSA'
  },
  contestId: {
    type: String,
    default: null
  },
  timeSpent: {
    type: Number,
    default: null
  },
  memoryUsed: {
    type: Number,
    default: null
  },
  codeLength: {
    type: Number,
    default: null
  },
  attemptNumber: {
    type: Number,
    default: 1
  },
  isFirstAccepted: {
    type: Boolean,
    default: false
  },
  timestamp: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

submissionSchema.index({ user: 1, timestamp: -1 });
submissionSchema.index({ platform: 1, submissionIdOnPlatform: 1 }, { unique: true });
submissionSchema.index({ user: 1, platform: 1 });
submissionSchema.index({ verdict: 1 });
submissionSchema.index({ difficulty: 1 });
submissionSchema.index({ tags: 1 });
submissionSchema.index({ timestamp: -1 });
submissionSchema.index({ user: 1, problem: 1 });

export default mongoose.model('Submission', submissionSchema);
