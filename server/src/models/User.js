import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId; // Password not required for Google OAuth users
    },
    minlength: 6
  },
  // Google OAuth fields
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  avatarUrl: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: 500,
    trim: true,
    default: ''
  },
  college: {
    type: String,
    maxlength: 100,
    trim: true,
    default: ''
  },
  location: {
    type: String,
    maxlength: 100,
    trim: true,
    default: ''
  },
  nationality: {
    type: String,
    maxlength: 50,
    trim: true,
    default: ''
  },
  socials: {
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    twitter: { type: String, default: '' },
    website: { type: String, default: '' }
  },
  profileViews: {
    type: Number,
    default: 0
  },
  shareId: {
    type: String,
    unique: true,
    sparse: true
  },
  handles: {
    type: Map,
    of: String,
    default: {}
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isMfaEnabled: {
    type: Boolean,
    default: false
  },
  mfaSecret: {
    type: String,
    default: null
  },
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Onboarding fields
  onboardingCompleted: {
    type: Boolean,
    default: false
  },
  onboarding: {
    country: {
      type: String,
      maxlength: 100,
      default: ''
    },
    degree: {
      type: String,
      maxlength: 100,
      default: ''
    },
    institution: {
      type: String,
      maxlength: 200,
      default: ''
    },
    branch: {
      type: String,
      maxlength: 100,
      default: ''
    },
    status: {
      type: String,
      enum: ['current', 'completed', ''],
      default: ''
    },
    graduationYear: {
      type: Number,
      default: null
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('User', userSchema);
