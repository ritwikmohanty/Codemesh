import mongoose from 'mongoose';

const notificationSettingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  contestReminders: {
    channels: [{
      type: String,
      enum: ['email', 'push']
    }],
    remindBeforeMinutes: {
      type: Number,
      default: 60
    }
  },
  featureUpdates: {
    email: {
      type: Boolean,
      default: true
    },
    inApp: {
      type: Boolean,
      default: true
    }
  }
});

// notificationSettingSchema.index({ user: 1 });

export default mongoose.model('NotificationSetting', notificationSettingSchema);
