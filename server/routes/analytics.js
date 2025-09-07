import express from 'express';
import Post from '../models/Post.js';
import Engagement from '../models/Engagement.js';
import SocialAccount from '../models/SocialAccount.js';
import { catchAsync } from '../middleware/errorHandler.js';

const router = express.Router();

// Get dashboard analytics
router.get('/dashboard', catchAsync(async (req, res) => {
  const userId = req.userId;
  const { dateRange = 30 } = req.query;
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(dateRange));
  
  // Get post analytics
  const postAnalytics = await Post.getUserAnalytics(userId, parseInt(dateRange));
  
  // Get engagement stats
  const engagementStats = await Engagement.getEngagementStats(userId, parseInt(dateRange));
  
  // Get connected accounts
  const connectedAccounts = await SocialAccount.find({
    userId,
    isActive: true
  }).select('platform profileInfo');
  
  // Calculate growth metrics (simplified)
  const previousPeriodStart = new Date(startDate);
  previousPeriodStart.setDate(previousPeriodStart.getDate() - parseInt(dateRange));
  
  const previousPostAnalytics = await Post.getUserAnalytics(userId, parseInt(dateRange), previousPeriodStart);
  
  const analytics = {
    overview: {
      totalPosts: postAnalytics[0]?.totalPosts || 0,
      totalLikes: postAnalytics[0]?.totalLikes || 0,
      totalShares: postAnalytics[0]?.totalShares || 0,
      totalComments: postAnalytics[0]?.totalComments || 0,
      totalReach: postAnalytics[0]?.totalReach || 0,
      avgEngagementRate: postAnalytics[0]?.avgEngagementRate || 0
    },
    growth: {
      postsGrowth: calculateGrowth(
        postAnalytics[0]?.totalPosts || 0,
        previousPostAnalytics[0]?.totalPosts || 0
      ),
      likesGrowth: calculateGrowth(
        postAnalytics[0]?.totalLikes || 0,
        previousPostAnalytics[0]?.totalLikes || 0
      ),
      reachGrowth: calculateGrowth(
        postAnalytics[0]?.totalReach || 0,
        previousPostAnalytics[0]?.totalReach || 0
      )
    },
    platformBreakdown: engagementStats,
    connectedAccounts: connectedAccounts.length,
    dateRange: parseInt(dateRange)
  };
  
  res.json({
    status: 'success',
    data: { analytics }
  });
}));

// Get post performance analytics
router.get('/posts', catchAsync(async (req, res) => {
  const userId = req.userId;
  const { dateRange = 30, platform } = req.query;
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(dateRange));
  
  const query = {
    userId,
    status: 'published',
    createdAt: { $gte: startDate }
  };
  
  if (platform) {
    query['platformSpecificData.platform'] = platform;
  }
  
  const posts = await Post.find(query)
    .select('content createdAt performanceMetrics platformSpecificData tags')
    .sort({ 'performanceMetrics.engagementRate': -1 })
    .limit(50);
  
  // Calculate top performing content
  const topPosts = posts.slice(0, 10);
  const avgMetrics = calculateAverageMetrics(posts);
  
  res.json({
    status: 'success',
    data: {
      topPosts,
      avgMetrics,
      totalPosts: posts.length
    }
  });
}));

// Get engagement analytics
router.get('/engagements', catchAsync(async (req, res) => {
  const userId = req.userId;
  const { dateRange = 30, platform } = req.query;
  
  const stats = await Engagement.getEngagementStats(userId, parseInt(dateRange));
  
  res.json({
    status: 'success',
    data: { stats }
  });
}));

// Helper functions
function calculateGrowth(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

function calculateAverageMetrics(posts) {
  if (posts.length === 0) {
    return {
      avgLikes: 0,
      avgShares: 0,
      avgComments: 0,
      avgEngagementRate: 0
    };
  }
  
  const totals = posts.reduce((acc, post) => {
    acc.likes += post.performanceMetrics.likes;
    acc.shares += post.performanceMetrics.shares;
    acc.comments += post.performanceMetrics.comments;
    acc.engagementRate += post.performanceMetrics.engagementRate;
    return acc;
  }, { likes: 0, shares: 0, comments: 0, engagementRate: 0 });
  
  return {
    avgLikes: Math.round(totals.likes / posts.length),
    avgShares: Math.round(totals.shares / posts.length),
    avgComments: Math.round(totals.comments / posts.length),
    avgEngagementRate: Math.round((totals.engagementRate / posts.length) * 100) / 100
  };
}

export default router;
