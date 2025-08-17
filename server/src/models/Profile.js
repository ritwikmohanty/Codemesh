import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  codeMeshRating: {
    type: Number,
    default: 0
  },
  platformData: [{
    platformName: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      default: 0
    },
    rank: mongoose.Schema.Types.Mixed,
    problemsSolvedCount: {
      type: Number,
      default: 0
    },
    lastSyncAt: {
      type: Date,
      default: Date.now
    }
  }],
  solvedProblems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem'
  }],
  topicStats: {
    type: Map,
    of: {
      solved: { type: Number, default: 0 },
      score: { type: Number, default: 0 }
    },
    default: {}
  },
  activityHeatmap: {
    type: Map,
    of: Number,
    default: {}
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

profileSchema.index({ codeMeshRating: -1 });
// profileSchema.index({ user: 1 });

export default mongoose.model('Profile', profileSchema);
