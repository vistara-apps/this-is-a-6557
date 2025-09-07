import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { catchAsync, AppError } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Get current user profile
router.get('/profile', catchAsync(async (req, res) => {
  const user = await User.findById(req.userId)
    .populate('connectedAccounts', 'platform profileInfo isActive');
  
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }
  
  res.json({
    status: 'success',
    data: { user }
  });
}));

// Update user profile
router.put('/profile', 
  [
    body('firstName').optional().trim().isLength({ min: 2, max: 50 }),
    body('lastName').optional().trim().isLength({ min: 2, max: 50 }),
    body('preferences.timezone').optional().isString(),
    body('preferences.notifications').optional().isObject()
  ],
  catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }
    
    const user = await User.findById(req.userId);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }
    
    // Update allowed fields
    const { firstName, lastName, preferences } = req.body;
    
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }
    
    await user.save();
    
    logger.info('User profile updated', { userId: user._id });
    
    res.json({
      status: 'success',
      message: 'Profile updated successfully',
      data: { user }
    });
  })
);

// Get user statistics
router.get('/stats', catchAsync(async (req, res) => {
  const userId = req.userId;
  
  // This would typically aggregate data from posts, engagements, etc.
  const stats = {
    totalPosts: 0,
    totalEngagements: 0,
    connectedAccounts: 0,
    subscriptionPlan: req.user.subscriptionPlan,
    subscriptionStatus: req.user.subscriptionStatus
  };
  
  res.json({
    status: 'success',
    data: { stats }
  });
}));

export default router;
