import mongoose from 'mongoose';

const focusSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  endTime: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  blockedSites: [{
    type: String,
    trim: true
  }]
});

focusSessionSchema.index({ user: 1 });
focusSessionSchema.index({ isActive: 1 });
focusSessionSchema.index({ startTime: -1 });

export default mongoose.model('FocusSession', focusSessionSchema);
