import mongoose from 'mongoose';

const notificationSettingSchema = new mongoose.Schema({
  // For authenticated users
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  // For anonymous users (session-based)
  userId: {
    type: String,
    default: null
  },
  enabled: {
    type: Boolean,
    default: false
  },
  methods: [{
    type: String,
    enum: ['push', 'calendar', 'email'],
    required: true
  }],
  platforms: [{
    type: String,
    enum: ['all', 'codeforces', 'codechef', 'atcoder', 'leetcode', 'hackerrank', 'geeksforgeeks', 'code360', 'hackerearth'],
    required: true
  }],
  difficulties: [{
    type: String,
    enum: ['all', 'easy', 'medium', 'hard'],
    required: true
  }],
  durations: [{
    type: String,
    enum: ['all', 'short', 'medium', 'long'],
    required: true
  }],
  reminderTime: {
    type: Number, // minutes before contest
    default: 60,
    min: 5,
    max: 10080 // 1 week
  },
  userName: {
    type: String,
    default: ''
  },
  userHandle: {
    type: String,
    default: ''
  },
  personalizedMessages: {
    type: Boolean,
    default: true
  },
  pushSubscription: {
    endpoint: String,
    keys: {
      p256dh: String,
      auth: String
    }
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  lastNotificationSent: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Create indexes - ensure only one of user or userId is set
notificationSettingSchema.index({ user: 1,userId:1 }, { unique: true, sparse: true });
notificationSettingSchema.index({ enabled: 1 });

// Validation to ensure either user or userId is set, but not both
notificationSettingSchema.pre('save', function(next) {
  if (this.user && this.userId) {
    this.userId = null; // Priority to authenticated user
  }
  if (!this.user && !this.userId) {
    return next(new Error('Either user or userId must be provided'));
  }
  next();
});

export default mongoose.model('NotificationSetting', notificationSettingSchema);
