import mongoose from 'mongoose';

const problemSchema = new mongoose.Schema({
  platform: {
    type: String,
    required: true,
    enum: ['codeforces', 'leetcode', 'codechef', 'hackerrank', 'atcoder', 'geeksforgeeks', 'code360', 'hackerearth']
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
  difficultyRating: {
    type: Number,
    default: null
  },
  category: {
    type: String,
    enum: ['CP', 'DSA', 'Fundamentals'],
    default: 'DSA'
  },
  tags: [{
    type: String,
    trim: true
  }],
  contestId: {
    type: String,
    default: null
  },
  solvedCount: {
    type: Number,
    default: 0
  }
});

problemSchema.index({ platform: 1, problemIdOnPlatform: 1 }, { unique: true });
problemSchema.index({ difficulty: 1 });
problemSchema.index({ tags: 1 });
problemSchema.index({ category: 1 });
problemSchema.index({ difficultyRating: 1 });

export default mongoose.model('Problem', problemSchema);
