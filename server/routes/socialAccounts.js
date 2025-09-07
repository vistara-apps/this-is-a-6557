import express from 'express';
import SocialAccount from '../models/SocialAccount.js';
import { catchAsync, AppError } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Get all connected social accounts
router.get('/', catchAsync(async (req, res) => {
  const accounts = await SocialAccount.find({
    userId: req.userId,
    isActive: true
  }).select('-accessToken -refreshToken');
  
  res.json({
    status: 'success',
    data: { accounts }
  });
}));

// Get single social account
router.get('/:id', catchAsync(async (req, res) => {
  const account = await SocialAccount.findOne({
    _id: req.params.id,
    userId: req.userId
  }).select('-accessToken -refreshToken');
  
  if (!account) {
    throw new AppError('Social account not found', 404, 'ACCOUNT_NOT_FOUND');
  }
  
  res.json({
    status: 'success',
    data: { account }
  });
}));

// Disconnect social account
router.delete('/:id', catchAsync(async (req, res) => {
  const account = await SocialAccount.findOne({
    _id: req.params.id,
    userId: req.userId
  });
  
  if (!account) {
    throw new AppError('Social account not found', 404, 'ACCOUNT_NOT_FOUND');
  }
  
  account.isActive = false;
  await account.save();
  
  logger.info('Social account disconnected', {
    userId: req.userId,
    platform: account.platform,
    accountId: account._id
  });
  
  res.json({
    status: 'success',
    message: 'Account disconnected successfully'
  });
}));

// OAuth callback handlers would be implemented here
// For now, these are placeholder endpoints

router.get('/connect/:platform', catchAsync(async (req, res) => {
  const { platform } = req.params;
  
  if (!['twitter', 'facebook', 'instagram', 'linkedin'].includes(platform)) {
    throw new AppError('Invalid platform', 400, 'INVALID_PLATFORM');
  }
  
  // In a real implementation, this would redirect to the OAuth provider
  res.json({
    status: 'success',
    message: `Redirect to ${platform} OAuth`,
    redirectUrl: `https://${platform}.com/oauth/authorize?client_id=...`
  });
}));

export default router;
