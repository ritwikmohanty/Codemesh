import mongoose from 'mongoose';

const recommendationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  suggestedProblems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem'
  }],
  reasoning: {
    type: String,
    trim: true
  },
  generatedAt: {
    type: Date,
    default: Date.now
  }
});

recommendationSchema.index({ user: 1 });
recommendationSchema.index({ generatedAt: -1 });

export default mongoose.model('Recommendation', recommendationSchema);
