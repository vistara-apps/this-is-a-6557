import mongoose from 'mongoose';

const engagementSchema = new mongoose.Schema({
  engagementId: {
    type: String,
    unique: true,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    default: null
  },
  socialAccountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SocialAccount',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['comment', 'mention', 'message', 'like', 'share', 'follow', 'reply'],
    required: true
  },
  platform: {
    type: String,
    enum: ['twitter', 'facebook', 'instagram', 'linkedin'],
    required: true
  },
  platformEngagementId: {
    type: String,
    required: true
  },
  author: {
    platformUserId: {
      type: String,
      required: true
    },
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
    verified: {
      type: Boolean,
      default: false
    }
  },
  content: {
    type: String,
    default: null
  },
  mediaUrls: [{
    type: String
  }],
  timestamp: {
    type: Date,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isReplied: {
    type: Boolean,
    default: false
  },
  reply: {
    content: {
      type: String,
      default: null
    },
    sentAt: {
      type: Date,
      default: null
    },
    platformReplyId: {
      type: String,
      default: null
    }
  },
  sentiment: {
    type: String,
    enum: ['positive', 'neutral', 'negative'],
    default: 'neutral'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  tags: [String],
  isArchived: {
    type: Boolean,
    default: false
  },
  metadata: {
    parentEngagementId: {
      type: String,
      default: null
    },
    threadId: {
      type: String,
      default: null
    },
    isThread: {
      type: Boolean,
      default: false
    },
    language: {
      type: String,
      default: null
    },
    location: {
      type: String,
      default: null
    }
  }
}, {
  timestamps: true
});

// Indexes for performance
engagementSchema.index({ userId: 1, timestamp: -1 });
engagementSchema.index({ socialAccountId: 1, timestamp: -1 });
engagementSchema.index({ postId: 1, timestamp: -1 });
engagementSchema.index({ platform: 1, type: 1 });
engagementSchema.index({ isRead: 1, userId: 1 });
engagementSchema.index({ platformEngagementId: 1, platform: 1 }, { unique: true });
engagementSchema.index({ priority: 1, isRead: 1 });

// Virtual for engagement age
engagementSchema.virtual('age').get(function() {
  return Date.now() - this.timestamp.getTime();
});

// Method to mark as read
engagementSchema.methods.markAsRead = function() {
  this.isRead = true;
  return this.save();
};

// Method to add reply
engagementSchema.methods.addReply = function(content, platformReplyId) {
  this.reply = {
    content,
    sentAt: new Date(),
    platformReplyId
  };
  this.isReplied = true;
  return this.save();
};

// Method to determine priority based on author and content
engagementSchema.methods.calculatePriority = function() {
  let priority = 'medium';
  
  // High priority for verified accounts
  if (this.author.verified) {
    priority = 'high';
  }
  
  // High priority for accounts with many followers
  if (this.author.followerCount > 10000) {
    priority = 'high';
  }
  
  // Urgent priority for negative sentiment
  if (this.sentiment === 'negative') {
    priority = 'urgent';
  }
  
  // High priority for mentions
  if (this.type === 'mention') {
    priority = 'high';
  }
  
  // Low priority for likes and follows
  if (['like', 'follow'].includes(this.type)) {
    priority = 'low';
  }
  
  this.priority = priority;
  return priority;
};

// Method to analyze sentiment (placeholder for AI integration)
engagementSchema.methods.analyzeSentiment = function() {
  if (!this.content) return 'neutral';
  
  // Simple keyword-based sentiment analysis (replace with AI service)
  const positiveWords = ['great', 'awesome', 'love', 'amazing', 'excellent', 'fantastic'];
  const negativeWords = ['bad', 'hate', 'terrible', 'awful', 'worst', 'horrible'];
  
  const content = this.content.toLowerCase();
  const positiveCount = positiveWords.filter(word => content.includes(word)).length;
  const negativeCount = negativeWords.filter(word => content.includes(word)).length;
  
  if (positiveCount > negativeCount) {
    this.sentiment = 'positive';
  } else if (negativeCount > positiveCount) {
    this.sentiment = 'negative';
  } else {
    this.sentiment = 'neutral';
  }
  
  return this.sentiment;
};

// Static method to get unread count for user
engagementSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({
    userId: new mongoose.Types.ObjectId(userId),
    isRead: false,
    isArchived: false
  });
};

// Static method to get engagement statistics
engagementSchema.statics.getEngagementStats = function(userId, dateRange = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - dateRange);
  
  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        timestamp: { $gte: startDate },
        isArchived: false
      }
    },
    {
      $group: {
        _id: {
          type: '$type',
          platform: '$platform'
        },
        count: { $sum: 1 },
        unreadCount: {
          $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] }
        }
      }
    },
    {
      $group: {
        _id: '$_id.platform',
        engagements: {
          $push: {
            type: '$_id.type',
            count: '$count',
            unreadCount: '$unreadCount'
          }
        },
        totalCount: { $sum: '$count' },
        totalUnread: { $sum: '$unreadCount' }
      }
    }
  ]);
};

// Static method to find high priority engagements
engagementSchema.statics.findHighPriority = function(userId, limit = 10) {
  return this.find({
    userId: new mongoose.Types.ObjectId(userId),
    priority: { $in: ['high', 'urgent'] },
    isRead: false,
    isArchived: false
  })
  .sort({ priority: -1, timestamp: -1 })
  .limit(limit)
  .populate('socialAccountId postId');
};

// Pre-save middleware to calculate priority and sentiment
engagementSchema.pre('save', function(next) {
  if (this.isNew) {
    this.analyzeSentiment();
    this.calculatePriority();
  }
  next();
});

const Engagement = mongoose.model('Engagement', engagementSchema);

export default Engagement;
