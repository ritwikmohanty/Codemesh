import mongoose from 'mongoose';

const problemSchema = new mongoose.Schema({
  platform: {
    type: String,
    required: true,
    enum: ['codeforces', 'leetcode', 'codechef', 'hackerrank', 'atcoder']
  },
  problemIdOnPlatform: {
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
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard', 'Expert'],
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }]
});

problemSchema.index({ platform: 1, problemIdOnPlatform: 1 }, { unique: true });
problemSchema.index({ difficulty: 1 });
problemSchema.index({ tags: 1 });

export default mongoose.model('Problem', problemSchema);
