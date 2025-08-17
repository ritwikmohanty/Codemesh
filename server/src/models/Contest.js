import mongoose from 'mongoose';

const contestSchema = new mongoose.Schema({
  platform: {
    type: String,
    required: true,
    enum: ['codeforces', 'leetcode', 'codechef', 'hackerrank', 'atcoder']
  },
  contestIdOnPlatform: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    required: true,
    unique: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  }
});

contestSchema.index({ platform: 1, contestIdOnPlatform: 1 }, { unique: true });
contestSchema.index({ startTime: 1 });

export default mongoose.model('Contest', contestSchema);
