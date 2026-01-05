import mongoose from 'mongoose';

/**
 * Battle Schema
 * Represents a competitive programming battle between users
 */
const battleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  startTime: {
    type: Date,
    required: true
  },
  durationMinutes: {
    type: Number,
    required: true,
    min: 10,
    max: 300
  },
  minRating: {
    type: Number,
    required: true,
    min: 800,
    max: 3500
  },
  maxRating: {
    type: Number,
    required: true,
    min: 800,
    max: 3500
  },
  numProblems: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  joinToken: {
    type: String,
    required: true,
    unique: true
  },
  // Participants are stored as subdocuments for efficient querying
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    codeforcesHandle: {
      type: String,
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Problems selected for this battle
  problems: [{
    contestId: {
      type: Number,
      required: true
    },
    index: {
      type: String,
      required: true
    },
    name: {
      type: String,
      default: ''
    },
    rating: {
      type: Number,
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  endedAt: {
    type: Date,
    default: null
  }
});

// Index for efficient queries
battleSchema.index({ status: 1, startTime: 1 });
battleSchema.index({ 'participants.user': 1 });
battleSchema.index({ createdBy: 1 });
battleSchema.index({ joinToken: 1 }, { unique: true });

// Virtual for end time
battleSchema.virtual('endTime').get(function() {
  if (!this.startTime || !this.durationMinutes) return null;
  return new Date(this.startTime.getTime() + this.durationMinutes * 60 * 1000);
});

// Method to check if user is participant
battleSchema.methods.isParticipant = function(userId) {
  return this.participants.some(p => p.user.toString() === userId.toString());
};

// Method to check if user is creator
battleSchema.methods.isCreator = function(userId) {
  return this.createdBy.toString() === userId.toString();
};

// Method to check if battle has started
battleSchema.methods.hasStarted = function() {
  return this.status !== 'pending';
};

// Method to check if battle is in progress
battleSchema.methods.isInProgress = function() {
  return this.status === 'in_progress';
};

// Method to check if battle is completed
battleSchema.methods.isCompleted = function() {
  return this.status === 'completed';
};

// Ensure virtuals are included when converting to JSON
battleSchema.set('toJSON', { virtuals: true });
battleSchema.set('toObject', { virtuals: true });

export default mongoose.model('Battle', battleSchema);
