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
  name: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  durationSeconds: {
    type: Number,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  status: {
    name: {
      type: String,
      enum: ['Upcoming', 'Live', 'Completed'],
      required: true
    },
    color: {
      type: String,
      required: true
    }
  },
  participants: {
    type: Number,
    default: null
  },
  registrationOpen: {
    type: Boolean,
    default: true
  },
  type: {
    type: String,
    default: 'Contest'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});



contestSchema.index({ platform: 1, contestIdOnPlatform: 1 }, { unique: true });
contestSchema.index({ startTime: 1 });
contestSchema.index({ platform: 1 });
contestSchema.index({ 'status.name': 1 });

const Contest = mongoose.model('Contest', contestSchema);


export default Contest;
