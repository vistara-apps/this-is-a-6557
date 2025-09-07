import mongoose from 'mongoose';

const socialAccountSchema = new mongoose.Schema({
  accountId: {
    type: String,
    unique: true,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  platform: {
    type: String,
    required: true,
    enum: ['twitter', 'facebook', 'instagram', 'linkedin']
  },
  platformUserId: {
    type: String,
    required: true
  },
  accessToken: {
    type: String,
    required: true
  },
  refreshToken: {
    type: String,
    default: null
  },
  tokenExpiresAt: {
    type: Date,
    default: null
  },
  profileInfo: {
    username: {
      type: String,
      required: true
    },
    displayName: {
      type: String,
      required: true
    },
    profilePicture: {
      type: String,
      default: null
    },
    followerCount: {
      type: Number,
      default: 0
    },
    followingCount: {
      type: Number,
      default: 0
    },
    bio: {
      type: String,
      default: null
    },
    verified: {
      type: Boolean,
      default: false
    }
  },
  permissions: {
    canPost: {
      type: Boolean,
      default: false
    },
    canReadMessages: {
      type: Boolean,
      default: false
    },
    canReadAnalytics: {
      type: Boolean,
      default: false
    },
    canManageAccount: {
      type: Boolean,
      default: false
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastSyncAt: {
    type: Date,
    default: null
  },
  syncErrors: [{
    error: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  rateLimitInfo: {
    remaining: {
      type: Number,
      default: null
    },
    resetTime: {
      type: Date,
      default: null
    }
  }
}, {
  timestamps: true
});

// Compound indexes for performance
socialAccountSchema.index({ userId: 1, platform: 1 });
socialAccountSchema.index({ platformUserId: 1, platform: 1 }, { unique: true });
socialAccountSchema.index({ userId: 1, isActive: 1 });

// Check if token is expired
socialAccountSchema.methods.isTokenExpired = function() {
  if (!this.tokenExpiresAt) return false;
  return this.tokenExpiresAt < new Date();
};

// Get platform-specific configuration
socialAccountSchema.methods.getPlatformConfig = function() {
  const configs = {
    twitter: {
      name: 'Twitter',
      color: '#1DA1F2',
      maxLength: 280,
      supportsImages: true,
      supportsVideos: true,
      supportsPolls: true,
      apiVersion: 'v2'
    },
    facebook: {
      name: 'Facebook',
      color: '#4267B2',
      maxLength: 8000,
      supportsImages: true,
      supportsVideos: true,
      supportsPolls: false,
      apiVersion: 'v18.0'
    },
    instagram: {
      name: 'Instagram',
      color: '#E4405F',
      maxLength: 2200,
      supportsImages: true,
      supportsVideos: true,
      supportsPolls: false,
      apiVersion: 'v18.0'
    },
    linkedin: {
      name: 'LinkedIn',
      color: '#0077B5',
      maxLength: 3000,
      supportsImages: true,
      supportsVideos: true,
      supportsPolls: false,
      apiVersion: 'v2'
    }
  };
  
  return configs[this.platform] || null;
};

// Update profile info
socialAccountSchema.methods.updateProfileInfo = function(profileData) {
  this.profileInfo = {
    ...this.profileInfo,
    ...profileData
  };
  this.lastSyncAt = new Date();
};

// Add sync error
socialAccountSchema.methods.addSyncError = function(error) {
  this.syncErrors.push({
    error: error.message || error,
    timestamp: new Date()
  });
  
  // Keep only last 10 errors
  if (this.syncErrors.length > 10) {
    this.syncErrors = this.syncErrors.slice(-10);
  }
};

// Update rate limit info
socialAccountSchema.methods.updateRateLimit = function(remaining, resetTime) {
  this.rateLimitInfo = {
    remaining,
    resetTime: new Date(resetTime)
  };
};

// Check if account can make API calls
socialAccountSchema.methods.canMakeApiCall = function() {
  if (!this.isActive) return false;
  if (this.isTokenExpired()) return false;
  
  // Check rate limits
  if (this.rateLimitInfo.remaining !== null && this.rateLimitInfo.remaining <= 0) {
    if (this.rateLimitInfo.resetTime && this.rateLimitInfo.resetTime > new Date()) {
      return false;
    }
  }
  
  return true;
};

const SocialAccount = mongoose.model('SocialAccount', socialAccountSchema);

export default SocialAccount;
