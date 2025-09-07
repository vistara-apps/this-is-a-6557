import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  postId: {
    type: String,
    unique: true,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 8000
  },
  mediaUrls: [{
    type: {
      type: String,
      enum: ['image', 'video', 'gif'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    thumbnailUrl: {
      type: String,
      default: null
    },
    altText: {
      type: String,
      default: null
    },
    size: {
      type: Number,
      default: null
    }
  }],
  scheduledAt: {
    type: Date,
    default: null
  },
  postedAt: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'publishing', 'published', 'failed'],
    default: 'draft'
  },
  platformSpecificData: [{
    platform: {
      type: String,
      enum: ['twitter', 'facebook', 'instagram', 'linkedin'],
      required: true
    },
    socialAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SocialAccount',
      required: true
    },
    platformPostId: {
      type: String,
      default: null
    },
    customContent: {
      type: String,
      default: null
    },
    hashtags: [String],
    mentions: [String],
    status: {
      type: String,
      enum: ['pending', 'published', 'failed'],
      default: 'pending'
    },
    publishedAt: {
      type: Date,
      default: null
    },
    error: {
      type: String,
      default: null
    }
  }],
  performanceMetrics: {
    likes: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    comments: {
      type: Number,
      default: 0
    },
    reach: {
      type: Number,
      default: 0
    },
    impressions: {
      type: Number,
      default: 0
    },
    clicks: {
      type: Number,
      default: 0
    },
    engagementRate: {
      type: Number,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  aiSuggestions: {
    optimalPostTime: {
      type: Date,
      default: null
    },
    suggestedHashtags: [String],
    suggestedMentions: [String],
    contentImprovements: [String],
    engagementPrediction: {
      type: Number,
      default: null
    }
  },
  tags: [String],
  category: {
    type: String,
    default: null
  },
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for performance
postSchema.index({ userId: 1, createdAt: -1 });
postSchema.index({ userId: 1, status: 1 });
postSchema.index({ scheduledAt: 1, status: 1 });
postSchema.index({ 'platformSpecificData.platform': 1, 'platformSpecificData.status': 1 });
postSchema.index({ tags: 1 });

// Virtual for total engagement
postSchema.virtual('totalEngagement').get(function() {
  const metrics = this.performanceMetrics;
  return metrics.likes + metrics.shares + metrics.comments;
});

// Method to check if post is scheduled
postSchema.methods.isScheduled = function() {
  return this.status === 'scheduled' && this.scheduledAt && this.scheduledAt > new Date();
};

// Method to check if post is ready to publish
postSchema.methods.isReadyToPublish = function() {
  return this.status === 'scheduled' && this.scheduledAt && this.scheduledAt <= new Date();
};

// Method to get platform-specific content
postSchema.methods.getContentForPlatform = function(platform) {
  const platformData = this.platformSpecificData.find(p => p.platform === platform);
  return platformData?.customContent || this.content;
};

// Method to update metrics
postSchema.methods.updateMetrics = function(platform, metrics) {
  // Update overall metrics (aggregate from all platforms)
  this.performanceMetrics.likes += metrics.likes || 0;
  this.performanceMetrics.shares += metrics.shares || 0;
  this.performanceMetrics.comments += metrics.comments || 0;
  this.performanceMetrics.reach += metrics.reach || 0;
  this.performanceMetrics.impressions += metrics.impressions || 0;
  this.performanceMetrics.clicks += metrics.clicks || 0;
  
  // Calculate engagement rate
  if (this.performanceMetrics.reach > 0) {
    this.performanceMetrics.engagementRate = 
      (this.totalEngagement / this.performanceMetrics.reach) * 100;
  }
  
  this.performanceMetrics.lastUpdated = new Date();
};

// Method to mark platform as published
postSchema.methods.markPlatformAsPublished = function(platform, platformPostId) {
  const platformData = this.platformSpecificData.find(p => p.platform === platform);
  if (platformData) {
    platformData.status = 'published';
    platformData.platformPostId = platformPostId;
    platformData.publishedAt = new Date();
    platformData.error = null;
  }
  
  // Check if all platforms are published
  const allPublished = this.platformSpecificData.every(p => p.status === 'published');
  if (allPublished) {
    this.status = 'published';
    this.postedAt = new Date();
  }
};

// Method to mark platform as failed
postSchema.methods.markPlatformAsFailed = function(platform, error) {
  const platformData = this.platformSpecificData.find(p => p.platform === platform);
  if (platformData) {
    platformData.status = 'failed';
    platformData.error = error;
  }
  
  // Check if any platform succeeded
  const anySucceeded = this.platformSpecificData.some(p => p.status === 'published');
  if (!anySucceeded) {
    this.status = 'failed';
  }
};

// Static method to find posts ready for publishing
postSchema.statics.findReadyToPublish = function() {
  return this.find({
    status: 'scheduled',
    scheduledAt: { $lte: new Date() }
  }).populate('userId platformSpecificData.socialAccountId');
};

// Static method to get user's post analytics
postSchema.statics.getUserAnalytics = function(userId, dateRange = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - dateRange);
  
  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startDate },
        status: 'published'
      }
    },
    {
      $group: {
        _id: null,
        totalPosts: { $sum: 1 },
        totalLikes: { $sum: '$performanceMetrics.likes' },
        totalShares: { $sum: '$performanceMetrics.shares' },
        totalComments: { $sum: '$performanceMetrics.comments' },
        totalReach: { $sum: '$performanceMetrics.reach' },
        totalImpressions: { $sum: '$performanceMetrics.impressions' },
        avgEngagementRate: { $avg: '$performanceMetrics.engagementRate' }
      }
    }
  ]);
};

const Post = mongoose.model('Post', postSchema);

export default Post;
