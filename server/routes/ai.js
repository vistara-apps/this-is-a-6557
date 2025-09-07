import express from 'express';
import { body, validationResult } from 'express-validator';
import OpenAI from 'openai';
import { catchAsync, AppError } from '../middleware/errorHandler.js';
import { requireActiveSubscription, rateLimitByUser } from '../middleware/auth.js';
import Post from '../models/Post.js';
import SocialAccount from '../models/SocialAccount.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORGANIZATION
});

// Rate limiting for AI requests
const aiRateLimit = rateLimitByUser(10, 60 * 60 * 1000); // 10 requests per hour

// Validation middleware
const validateContentSuggestion = [
  body('content')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Content must be between 10 and 1000 characters'),
  body('platforms')
    .isArray({ min: 1 })
    .withMessage('At least one platform must be selected'),
  body('platforms.*')
    .isIn(['twitter', 'facebook', 'instagram', 'linkedin'])
    .withMessage('Invalid platform specified')
];

const validateOptimalTiming = [
  body('platforms')
    .isArray({ min: 1 })
    .withMessage('At least one platform must be selected'),
  body('platforms.*')
    .isIn(['twitter', 'facebook', 'instagram', 'linkedin'])
    .withMessage('Invalid platform specified'),
  body('contentType')
    .optional()
    .isIn(['text', 'image', 'video', 'link'])
    .withMessage('Invalid content type'),
  body('targetAudience')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Target audience description too long')
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

// Get content suggestions and improvements
router.post('/content-suggestions', 
  requireActiveSubscription,
  aiRateLimit,
  validateContentSuggestion,
  handleValidationErrors,
  catchAsync(async (req, res) => {
    const { content, platforms, contentType = 'text', targetAudience } = req.body;
    const userId = req.userId;

    // Check user's AI usage limits
    const userLimits = req.user.getSubscriptionLimits();
    if (userLimits.aiSuggestionsPerDay !== -1) {
      // Check daily usage (implement usage tracking)
      // For now, we'll skip this check
    }

    // Get user's connected accounts for context
    const connectedAccounts = await SocialAccount.find({
      userId,
      platform: { $in: platforms },
      isActive: true
    });

    if (connectedAccounts.length === 0) {
      throw new AppError('No connected accounts found for the specified platforms', 400, 'NO_CONNECTED_ACCOUNTS');
    }

    // Prepare context for AI
    const platformContext = platforms.map(platform => {
      const account = connectedAccounts.find(acc => acc.platform === platform);
      const config = account?.getPlatformConfig();
      return {
        platform,
        maxLength: config?.maxLength || 280,
        supportsImages: config?.supportsImages || false,
        supportsVideos: config?.supportsVideos || false
      };
    });

    // Create AI prompt
    const prompt = `
As a social media expert, analyze and improve the following content for multiple platforms:

Original Content: "${content}"
Content Type: ${contentType}
Target Audience: ${targetAudience || 'General audience'}
Platforms: ${platforms.join(', ')}

Platform Constraints:
${platformContext.map(p => `- ${p.platform}: max ${p.maxLength} characters, images: ${p.supportsImages}, videos: ${p.supportsVideos}`).join('\n')}

Please provide:
1. Platform-specific optimized versions of the content
2. Suggested hashtags for each platform (relevant and trending)
3. Optimal posting times based on platform best practices
4. Engagement improvement suggestions
5. Content performance prediction (1-10 scale)

Format your response as JSON with the following structure:
{
  "platformOptimizations": {
    "twitter": { "content": "...", "hashtags": ["..."], "mentions": ["..."] },
    "facebook": { "content": "...", "hashtags": ["..."] },
    // ... other platforms
  },
  "generalSuggestions": ["suggestion1", "suggestion2", ...],
  "optimalPostTimes": {
    "twitter": "2024-01-15T14:00:00Z",
    "facebook": "2024-01-15T13:00:00Z",
    // ... other platforms
  },
  "engagementPrediction": {
    "twitter": 7,
    "facebook": 6,
    // ... other platforms
  },
  "improvementTips": ["tip1", "tip2", ...]
}
`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert social media strategist with deep knowledge of platform-specific best practices, trending topics, and audience engagement strategies."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      });

      const aiResponse = completion.choices[0].message.content;
      
      // Parse AI response
      let suggestions;
      try {
        suggestions = JSON.parse(aiResponse);
      } catch (parseError) {
        logger.error('Failed to parse AI response:', parseError);
        throw new AppError('Failed to process AI suggestions', 500, 'AI_PARSE_ERROR');
      }

      // Log AI usage
      logger.logAIRequest('content_suggestions', userId, prompt, aiResponse, completion.usage?.total_tokens);

      res.json({
        status: 'success',
        data: {
          suggestions,
          usage: {
            tokensUsed: completion.usage?.total_tokens || 0,
            model: 'gpt-4'
          }
        }
      });

    } catch (error) {
      logger.error('OpenAI API error:', error);
      
      if (error.code === 'insufficient_quota') {
        throw new AppError('AI service temporarily unavailable', 503, 'AI_QUOTA_EXCEEDED');
      }
      
      throw new AppError('Failed to generate content suggestions', 500, 'AI_SERVICE_ERROR');
    }
  })
);

// Get optimal posting times
router.post('/optimal-timing',
  requireActiveSubscription,
  aiRateLimit,
  validateOptimalTiming,
  handleValidationErrors,
  catchAsync(async (req, res) => {
    const { platforms, contentType = 'text', targetAudience, timezone = 'UTC' } = req.body;
    const userId = req.userId;

    // Get user's historical post performance for better predictions
    const historicalPosts = await Post.find({
      userId,
      status: 'published',
      createdAt: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } // Last 90 days
    }).select('createdAt performanceMetrics platformSpecificData');

    // Analyze historical performance by time and platform
    const performanceByTime = {};
    platforms.forEach(platform => {
      performanceByTime[platform] = {};
    });

    historicalPosts.forEach(post => {
      const hour = new Date(post.createdAt).getHours();
      const dayOfWeek = new Date(post.createdAt).getDay();
      
      post.platformSpecificData.forEach(platformData => {
        if (platforms.includes(platformData.platform)) {
          const key = `${dayOfWeek}-${hour}`;
          if (!performanceByTime[platformData.platform][key]) {
            performanceByTime[platformData.platform][key] = {
              posts: 0,
              totalEngagement: 0,
              avgEngagement: 0
            };
          }
          
          const engagement = post.performanceMetrics.likes + 
                           post.performanceMetrics.shares + 
                           post.performanceMetrics.comments;
          
          performanceByTime[platformData.platform][key].posts++;
          performanceByTime[platformData.platform][key].totalEngagement += engagement;
          performanceByTime[platformData.platform][key].avgEngagement = 
            performanceByTime[platformData.platform][key].totalEngagement / 
            performanceByTime[platformData.platform][key].posts;
        }
      });
    });

    // Create AI prompt for optimal timing
    const prompt = `
As a social media timing expert, recommend optimal posting times for the following:

Platforms: ${platforms.join(', ')}
Content Type: ${contentType}
Target Audience: ${targetAudience || 'General audience'}
User Timezone: ${timezone}

Historical Performance Data:
${JSON.stringify(performanceByTime, null, 2)}

Consider:
1. Platform-specific peak engagement times
2. Target audience demographics and behavior
3. Content type performance patterns
4. Day of week variations
5. Seasonal trends
6. User's historical performance data

Provide recommendations for:
- Next 7 days optimal posting times
- Best days of the week for each platform
- Time slots to avoid
- Frequency recommendations

Format as JSON:
{
  "recommendations": {
    "twitter": {
      "nextWeek": ["2024-01-15T14:00:00Z", "2024-01-16T15:00:00Z", ...],
      "bestDays": ["Monday", "Wednesday", "Friday"],
      "bestHours": [9, 12, 15, 18],
      "frequency": "3-5 posts per day"
    },
    // ... other platforms
  },
  "generalInsights": ["insight1", "insight2", ...],
  "avoidTimes": {
    "twitter": ["2024-01-15T02:00:00Z", ...],
    // ... other platforms
  }
}
`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a social media timing expert with deep knowledge of platform algorithms, audience behavior patterns, and optimal posting strategies across different time zones and demographics."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.3
      });

      const aiResponse = completion.choices[0].message.content;
      
      // Parse AI response
      let timingRecommendations;
      try {
        timingRecommendations = JSON.parse(aiResponse);
      } catch (parseError) {
        logger.error('Failed to parse AI timing response:', parseError);
        throw new AppError('Failed to process timing recommendations', 500, 'AI_PARSE_ERROR');
      }

      // Log AI usage
      logger.logAIRequest('optimal_timing', userId, prompt, aiResponse, completion.usage?.total_tokens);

      res.json({
        status: 'success',
        data: {
          timingRecommendations,
          historicalDataPoints: historicalPosts.length,
          usage: {
            tokensUsed: completion.usage?.total_tokens || 0,
            model: 'gpt-4'
          }
        }
      });

    } catch (error) {
      logger.error('OpenAI API error:', error);
      
      if (error.code === 'insufficient_quota') {
        throw new AppError('AI service temporarily unavailable', 503, 'AI_QUOTA_EXCEEDED');
      }
      
      throw new AppError('Failed to generate timing recommendations', 500, 'AI_SERVICE_ERROR');
    }
  })
);

// Get hashtag suggestions
router.post('/hashtag-suggestions',
  requireActiveSubscription,
  aiRateLimit,
  catchAsync(async (req, res) => {
    const { content, platforms, industry, targetAudience } = req.body;
    const userId = req.userId;

    if (!content || !platforms || platforms.length === 0) {
      throw new AppError('Content and platforms are required', 400, 'MISSING_REQUIRED_FIELDS');
    }

    const prompt = `
Generate relevant and trending hashtags for the following social media content:

Content: "${content}"
Platforms: ${platforms.join(', ')}
Industry: ${industry || 'General'}
Target Audience: ${targetAudience || 'General audience'}

Provide:
1. Platform-specific hashtags (considering character limits and best practices)
2. Mix of popular and niche hashtags
3. Trending hashtags relevant to the content
4. Industry-specific hashtags
5. Branded hashtags suggestions

Format as JSON:
{
  "platformHashtags": {
    "twitter": ["#hashtag1", "#hashtag2", ...],
    "instagram": ["#hashtag1", "#hashtag2", ...],
    // ... other platforms
  },
  "trendingHashtags": ["#trending1", "#trending2", ...],
  "industryHashtags": ["#industry1", "#industry2", ...],
  "brandedSuggestions": ["#YourBrand", "#YourCampaign", ...]
}
`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a social media hashtag expert with knowledge of trending topics, platform-specific best practices, and hashtag strategies for maximum reach and engagement."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.5
      });

      const aiResponse = completion.choices[0].message.content;
      const hashtagSuggestions = JSON.parse(aiResponse);

      // Log AI usage
      logger.logAIRequest('hashtag_suggestions', userId, prompt, aiResponse, completion.usage?.total_tokens);

      res.json({
        status: 'success',
        data: {
          hashtagSuggestions,
          usage: {
            tokensUsed: completion.usage?.total_tokens || 0,
            model: 'gpt-3.5-turbo'
          }
        }
      });

    } catch (error) {
      logger.error('OpenAI API error:', error);
      throw new AppError('Failed to generate hashtag suggestions', 500, 'AI_SERVICE_ERROR');
    }
  })
);

export default router;
