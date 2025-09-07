import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import logger from '../utils/logger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Generate JWT token
export const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Verify JWT token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// Authentication middleware
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        error: 'Access token required',
        code: 'TOKEN_REQUIRED'
      });
    }

    const decoded = verifyToken(token);
    
    // Find user and check if still active
    const user = await User.findById(decoded.userId).select('-passwordHash');
    
    if (!user) {
      return res.status(401).json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        error: 'Account deactivated',
        code: 'ACCOUNT_DEACTIVATED'
      });
    }

    // Check subscription status for protected features
    if (!user.hasActiveSubscription()) {
      // Allow basic operations but flag subscription status
      req.subscriptionExpired = true;
    }

    // Attach user to request
    req.user = user;
    req.userId = user._id;
    
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    return res.status(500).json({ 
      error: 'Authentication failed',
      code: 'AUTH_FAILED'
    });
  }
};

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.userId).select('-passwordHash');
      
      if (user && user.isActive) {
        req.user = user;
        req.userId = user._id;
        req.subscriptionExpired = !user.hasActiveSubscription();
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Check subscription middleware
export const requireActiveSubscription = (req, res, next) => {
  if (req.subscriptionExpired) {
    return res.status(402).json({
      error: 'Active subscription required',
      code: 'SUBSCRIPTION_REQUIRED',
      subscriptionPlan: req.user.subscriptionPlan,
      subscriptionStatus: req.user.subscriptionStatus
    });
  }
  next();
};

// Check subscription plan middleware
export const requireSubscriptionPlan = (requiredPlans) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const userPlan = req.user.subscriptionPlan;
    const planHierarchy = ['starter', 'pro', 'business'];
    const userPlanIndex = planHierarchy.indexOf(userPlan);
    
    const hasRequiredPlan = requiredPlans.some(plan => {
      const requiredPlanIndex = planHierarchy.indexOf(plan);
      return userPlanIndex >= requiredPlanIndex;
    });

    if (!hasRequiredPlan) {
      return res.status(403).json({
        error: 'Insufficient subscription plan',
        code: 'PLAN_UPGRADE_REQUIRED',
        currentPlan: userPlan,
        requiredPlans
      });
    }

    next();
  };
};

// Rate limiting by user
export const rateLimitByUser = (maxRequests, windowMs) => {
  const userRequests = new Map();

  return (req, res, next) => {
    if (!req.userId) {
      return next();
    }

    const userId = req.userId.toString();
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old entries
    if (userRequests.has(userId)) {
      const requests = userRequests.get(userId).filter(time => time > windowStart);
      userRequests.set(userId, requests);
    } else {
      userRequests.set(userId, []);
    }

    const requests = userRequests.get(userId);

    if (requests.length >= maxRequests) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil((requests[0] + windowMs - now) / 1000)
      });
    }

    requests.push(now);
    next();
  };
};

// Admin middleware
export const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({
      error: 'Admin access required',
      code: 'ADMIN_REQUIRED'
    });
  }
  next();
};

export default {
  generateToken,
  verifyToken,
  authenticateToken,
  optionalAuth,
  requireActiveSubscription,
  requireSubscriptionPlan,
  rateLimitByUser,
  requireAdmin
};
