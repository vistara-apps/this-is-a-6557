import express from 'express';
import Engagement from '../models/Engagement.js';
import { catchAsync, AppError } from '../middleware/errorHandler.js';

const router = express.Router();

// Get all engagements (unified inbox)
router.get('/', catchAsync(async (req, res) => {
  const { page = 1, limit = 20, type, platform, isRead, priority } = req.query;
  const userId = req.userId;
  
  // Build query
  const query = { userId, isArchived: false };
  
  if (type) query.type = type;
  if (platform) query.platform = platform;
  if (isRead !== undefined) query.isRead = isRead === 'true';
  if (priority) query.priority = priority;
  
  const engagements = await Engagement.find(query)
    .populate('socialAccountId', 'platform profileInfo')
    .populate('postId', 'content')
    .sort({ priority: -1, timestamp: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
  
  const total = await Engagement.countDocuments(query);
  const unreadCount = await Engagement.getUnreadCount(userId);
  
  res.json({
    status: 'success',
    data: {
      engagements,
      unreadCount,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
}));

// Mark engagement as read
router.put('/:id/read', catchAsync(async (req, res) => {
  const engagement = await Engagement.findOne({
    _id: req.params.id,
    userId: req.userId
  });
  
  if (!engagement) {
    throw new AppError('Engagement not found', 404, 'ENGAGEMENT_NOT_FOUND');
  }
  
  await engagement.markAsRead();
  
  res.json({
    status: 'success',
    message: 'Engagement marked as read'
  });
}));

// Reply to engagement
router.post('/:id/reply', catchAsync(async (req, res) => {
  const { content } = req.body;
  
  if (!content || content.trim().length === 0) {
    throw new AppError('Reply content is required', 400, 'CONTENT_REQUIRED');
  }
  
  const engagement = await Engagement.findOne({
    _id: req.params.id,
    userId: req.userId
  });
  
  if (!engagement) {
    throw new AppError('Engagement not found', 404, 'ENGAGEMENT_NOT_FOUND');
  }
  
  // In a real implementation, this would post the reply to the social platform
  // For now, we'll just save it locally
  await engagement.addReply(content, 'mock-platform-reply-id');
  
  res.json({
    status: 'success',
    message: 'Reply sent successfully'
  });
}));

// Get engagement statistics
router.get('/stats', catchAsync(async (req, res) => {
  const userId = req.userId;
  const { dateRange = 30 } = req.query;
  
  const stats = await Engagement.getEngagementStats(userId, parseInt(dateRange));
  
  res.json({
    status: 'success',
    data: { stats }
  });
}));

export default router;
