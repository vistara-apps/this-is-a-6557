import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    unique: true,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  avatar: {
    type: String,
    default: null
  },
  subscriptionPlan: {
    type: String,
    enum: ['starter', 'pro', 'business'],
    default: 'starter'
  },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'inactive', 'cancelled', 'past_due'],
    default: 'active'
  },
  stripeCustomerId: {
    type: String,
    default: null
  },
  subscriptionEndDate: {
    type: Date,
    default: null
  },
  connectedAccounts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SocialAccount'
  }],
  preferences: {
    timezone: {
      type: String,
      default: 'UTC'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      newEngagements: {
        type: Boolean,
        default: true
      },
      postReminders: {
        type: Boolean,
        default: true
      }
    },
    aiSuggestions: {
      type: Boolean,
      default: true
    }
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    default: null
  },
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  },
  lastLoginAt: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.passwordHash;
      delete ret.emailVerificationToken;
      delete ret.resetPasswordToken;
      delete ret.resetPasswordExpires;
      return ret;
    }
  }
});

// Index for performance
userSchema.index({ email: 1 });
userSchema.index({ userId: 1 });
userSchema.index({ subscriptionPlan: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Get full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Check if subscription is active
userSchema.methods.hasActiveSubscription = function() {
  if (this.subscriptionStatus !== 'active') return false;
  if (this.subscriptionEndDate && this.subscriptionEndDate < new Date()) return false;
  return true;
};

// Get subscription limits
userSchema.methods.getSubscriptionLimits = function() {
  const limits = {
    starter: {
      maxAccounts: 3,
      maxPostsPerMonth: 100,
      aiSuggestionsPerDay: 10,
      analyticsHistory: 30 // days
    },
    pro: {
      maxAccounts: 10,
      maxPostsPerMonth: 500,
      aiSuggestionsPerDay: 50,
      analyticsHistory: 90 // days
    },
    business: {
      maxAccounts: -1, // unlimited
      maxPostsPerMonth: -1, // unlimited
      aiSuggestionsPerDay: -1, // unlimited
      analyticsHistory: 365 // days
    }
  };
  
  return limits[this.subscriptionPlan] || limits.starter;
};

const User = mongoose.model('User', userSchema);

export default User;
