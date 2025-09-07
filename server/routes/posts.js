import express from 'express';
import { body, query, validationResult } from 'express-validator';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import Post from '../models/Post.js';
import SocialAccount from '../models/SocialAccount.js';
import { catchAsync, AppError } from '../middleware/errorHandler.js';
import { requireActiveSubscription } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,video/mp4').split(',');
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError('Invalid file type', 400, 'INVALID_FILE_TYPE'), false);
    }
  }
});

// Validation middleware
const validateCreatePost = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 8000 })
    .withMessage('Content must be between 1 and 8000 characters'),
  body('platforms')
    .isArray({ min: 1 })
    .withMessage('At least one platform must be selected'),
  body('platforms.*')
    .isIn(['twitter', 'facebook', 'instagram', 'linkedin'])
    .withMessage('Invalid platform specified'),
  body('scheduledAt')
    .optional()
    .isISO8601()
    .withMessage('Invalid scheduled date format'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('category')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Category too long')
];

const validateUpdatePost = [
  body('content')
    .optional()
    .trim()
    .isLength({ min: 1, max: 8000 })
    .withMessage('Content must be between 1 and 8000 characters'),
  body('scheduledAt')
    .optional()
    .isISO8601()
    .withMessage('Invalid scheduled date format'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('category')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Category too long')
];

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: errors.array()
    });
  }
  next();
};

// Helper function to process uploaded media
const processMedia = async (files) => {
  const mediaUrls = [];
  
  for (const file of files) {
    const fileExtension = path.extname(file.originalname);
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}${fileExtension}`;
    const filePath = path.join('uploads', fileName);
    
    // Ensure uploads directory exists
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads', { recursive: true });
    }
    
    let processedBuffer = file.buffer;
    let thumbnailUrl = null;
    
    // Process images
    if (file.mimetype.startsWith('image/')) {
      // Optimize image
      processedBuffer = await sharp(file.buffer)
        .resize(2048, 2048, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();
      
      // Create thumbnail
      const thumbnailBuffer = await sharp(file.buffer)
        .resize(300, 300, { fit: 'cover' })
        .jpeg({ quality: 80 })
        .toBuffer();
      
      const thumbnailFileName = `thumb_${fileName}`;
      const thumbnailPath = path.join('uploads', thumbnailFileName);
      fs.writeFileSync(thumbnailPath, thumbnailBuffer);
      thumbnailUrl = `/uploads/${thumbnailFileName}`;
    }
    
    // Save processed file
    fs.writeFileSync(filePath, processedBuffer);
    
    mediaUrls.push({
      type: file.mimetype.startsWith('image/') ? 'image' : 'video',
      url: `/uploads/${fileName}`,
      thumbnailUrl,
      size: processedBuffer.length,
      altText: null
    });
  }
  
  return mediaUrls;
};

// Get all posts for user
router.get('/', catchAsync(async (req, res) => {
  const { page = 1, limit = 20, status, platform, category, search } = req.query;
  const userId = req.userId;
  
  // Build query
  const query = { userId, isArchived: false };
  
  if (status) {
    query.status = status;
  }
  
  if (platform) {
    query['platformSpecificData.platform'] = platform;
  }
  
  if (category) {
    query.category = category;
  }
  
  if (search) {
    query.$or = [
      { content: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];
  }
  
  // Execute query with pagination
  const posts = await Post.find(query)
    .populate('platformSpecificData.socialAccountId', 'platform profileInfo')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
  
  const total = await Post.countDocuments(query);
  
  res.json({
    status: 'success',
    data: {
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
}));

// Get single post
router.get('/:id', catchAsync(async (req, res) => {
  const post = await Post.findOne({
    _id: req.params.id,
    userId: req.userId
  }).populate('platformSpecificData.socialAccountId', 'platform profileInfo');
  
  if (!post) {
    throw new AppError('Post not found', 404, 'POST_NOT_FOUND');
  }
  
  res.json({
    status: 'success',
    data: { post }
  });
}));

// Create new post
router.post('/',
  requireActiveSubscription,
  upload.array('media', 10),
  validateCreatePost,
  handleValidationErrors,
  catchAsync(async (req, res) => {
    const { content, platforms, scheduledAt, tags, category, platformSpecificContent } = req.body;
    const userId = req.userId;
    const files = req.files || [];
    
    // Check user's subscription limits
    const userLimits = req.user.getSubscriptionLimits();
    if (userLimits.maxPostsPerMonth !== -1) {
      const currentMonth = new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);
      
      const postsThisMonth = await Post.countDocuments({
        userId,
        createdAt: { $gte: currentMonth }
      });
      
      if (postsThisMonth >= userLimits.maxPostsPerMonth) {
        throw new AppError('Monthly post limit reached', 402, 'POST_LIMIT_REACHED');
      }
    }
    
    // Verify user has connected accounts for selected platforms
    const connectedAccounts = await SocialAccount.find({
      userId,
      platform: { $in: platforms },
      isActive: true
    });
    
    if (connectedAccounts.length !== platforms.length) {
      const missingPlatforms = platforms.filter(p => 
        !connectedAccounts.some(acc => acc.platform === p)
      );
      throw new AppError(
        `Missing connected accounts for: ${missingPlatforms.join(', ')}`,
        400,
        'MISSING_ACCOUNTS'
      );
    }
    
    // Process uploaded media
    const mediaUrls = files.length > 0 ? await processMedia(files) : [];
    
    // Create platform-specific data
    const platformSpecificData = platforms.map(platform => {
      const account = connectedAccounts.find(acc => acc.platform === platform);
      const customContent = platformSpecificContent?.[platform];
      
      return {
        platform,
        socialAccountId: account._id,
        customContent,
        hashtags: [],
        mentions: [],
        status: 'pending'
      };
    });
    
    // Create post
    const post = new Post({
      userId,
      content,
      mediaUrls,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      status: scheduledAt ? 'scheduled' : 'draft',
      platformSpecificData,
      tags: tags || [],
      category
    });
    
    await post.save();
    
    // Log post creation
    logger.info('Post created', {
      userId,
      postId: post._id,
      platforms,
      scheduled: !!scheduledAt,
      hasMedia: mediaUrls.length > 0
    });
    
    // Populate the response
    await post.populate('platformSpecificData.socialAccountId', 'platform profileInfo');
    
    res.status(201).json({
      status: 'success',
      message: 'Post created successfully',
      data: { post }
    });
  })
);

// Update post
router.put('/:id',
  validateUpdatePost,
  handleValidationErrors,
  catchAsync(async (req, res) => {
    const { content, scheduledAt, tags, category } = req.body;
    const userId = req.userId;
    
    const post = await Post.findOne({
      _id: req.params.id,
      userId
    });
    
    if (!post) {
      throw new AppError('Post not found', 404, 'POST_NOT_FOUND');
    }
    
    // Check if post can be updated
    if (post.status === 'published') {
      throw new AppError('Cannot update published post', 400, 'POST_ALREADY_PUBLISHED');
    }
    
    if (post.status === 'publishing') {
      throw new AppError('Cannot update post while publishing', 400, 'POST_PUBLISHING');
    }
    
    // Update fields
    if (content !== undefined) post.content = content;
    if (scheduledAt !== undefined) {
      post.scheduledAt = scheduledAt ? new Date(scheduledAt) : null;
      post.status = scheduledAt ? 'scheduled' : 'draft';
    }
    if (tags !== undefined) post.tags = tags;
    if (category !== undefined) post.category = category;
    
    await post.save();
    
    logger.info('Post updated', {
      userId,
      postId: post._id,
      changes: Object.keys(req.body)
    });
    
    await post.populate('platformSpecificData.socialAccountId', 'platform profileInfo');
    
    res.json({
      status: 'success',
      message: 'Post updated successfully',
      data: { post }
    });
  })
);

// Delete post
router.delete('/:id', catchAsync(async (req, res) => {
  const userId = req.userId;
  
  const post = await Post.findOne({
    _id: req.params.id,
    userId
  });
  
  if (!post) {
    throw new AppError('Post not found', 404, 'POST_NOT_FOUND');
  }
  
  // Check if post can be deleted
  if (post.status === 'publishing') {
    throw new AppError('Cannot delete post while publishing', 400, 'POST_PUBLISHING');
  }
  
  // Soft delete by archiving
  post.isArchived = true;
  await post.save();
  
  logger.info('Post deleted', {
    userId,
    postId: post._id,
    status: post.status
  });
  
  res.json({
    status: 'success',
    message: 'Post deleted successfully'
  });
}));

// Duplicate post
router.post('/:id/duplicate', catchAsync(async (req, res) => {
  const userId = req.userId;
  
  const originalPost = await Post.findOne({
    _id: req.params.id,
    userId
  }).populate('platformSpecificData.socialAccountId');
  
  if (!originalPost) {
    throw new AppError('Post not found', 404, 'POST_NOT_FOUND');
  }
  
  // Create duplicate
  const duplicatePost = new Post({
    userId,
    content: originalPost.content,
    mediaUrls: originalPost.mediaUrls,
    platformSpecificData: originalPost.platformSpecificData.map(p => ({
      platform: p.platform,
      socialAccountId: p.socialAccountId,
      customContent: p.customContent,
      hashtags: p.hashtags,
      mentions: p.mentions,
      status: 'pending'
    })),
    tags: originalPost.tags,
    category: originalPost.category,
    status: 'draft'
  });
  
  await duplicatePost.save();
  await duplicatePost.populate('platformSpecificData.socialAccountId', 'platform profileInfo');
  
  logger.info('Post duplicated', {
    userId,
    originalPostId: originalPost._id,
    duplicatePostId: duplicatePost._id
  });
  
  res.status(201).json({
    status: 'success',
    message: 'Post duplicated successfully',
    data: { post: duplicatePost }
  });
}));

// Get post analytics
router.get('/:id/analytics', catchAsync(async (req, res) => {
  const userId = req.userId;
  
  const post = await Post.findOne({
    _id: req.params.id,
    userId
  }).populate('platformSpecificData.socialAccountId', 'platform profileInfo');
  
  if (!post) {
    throw new AppError('Post not found', 404, 'POST_NOT_FOUND');
  }
  
  if (post.status !== 'published') {
    throw new AppError('Analytics only available for published posts', 400, 'POST_NOT_PUBLISHED');
  }
  
  // Calculate engagement metrics
  const analytics = {
    overview: {
      totalLikes: post.performanceMetrics.likes,
      totalShares: post.performanceMetrics.shares,
      totalComments: post.performanceMetrics.comments,
      totalReach: post.performanceMetrics.reach,
      totalImpressions: post.performanceMetrics.impressions,
      engagementRate: post.performanceMetrics.engagementRate,
      lastUpdated: post.performanceMetrics.lastUpdated
    },
    platformBreakdown: post.platformSpecificData.map(p => ({
      platform: p.platform,
      status: p.status,
      publishedAt: p.publishedAt,
      platformPostId: p.platformPostId,
      error: p.error
    })),
    timeline: {
      // This would be populated with time-series data in a real implementation
      hourlyEngagement: [],
      dailyEngagement: []
    }
  };
  
  res.json({
    status: 'success',
    data: { analytics }
  });
}));

export default router;
