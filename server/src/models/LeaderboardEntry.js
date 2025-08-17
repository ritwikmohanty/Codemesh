import mongoose from 'mongoose';

const leaderboardEntrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  globalScore: {
    type: Number,
    default: 0
  },
  monthlyScore: {
    type: Number,
    default: 0
  },
  weeklyScore: {
    type: Number,
    default: 0
  },
  lastProblemSolvedAt: {
    type: Date,
    default: null
  }
});

leaderboardEntrySchema.index({ globalScore: -1 });
leaderboardEntrySchema.index({ monthlyScore: -1 });
leaderboardEntrySchema.index({ weeklyScore: -1 });

export default mongoose.model('LeaderboardEntry', leaderboardEntrySchema);
