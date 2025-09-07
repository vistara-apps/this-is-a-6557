import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';
import { catchAsync, AppError } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Validation middleware
const validateRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const validateForgotPassword = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
];

const validateResetPassword = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number')
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

// Register new user
router.post('/register', validateRegistration, handleValidationErrors, catchAsync(async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('User with this email already exists', 400, 'USER_EXISTS');
  }

  // Create new user
  const user = new User({
    email,
    passwordHash: password, // Will be hashed by pre-save middleware
    firstName,
    lastName,
    emailVerificationToken: crypto.randomBytes(32).toString('hex')
  });

  await user.save();

  // Generate JWT token
  const token = generateToken(user._id);

  // Log registration
  logger.info('User registered', {
    userId: user._id,
    email: user.email,
    subscriptionPlan: user.subscriptionPlan
  });

  res.status(201).json({
    status: 'success',
    message: 'User registered successfully',
    data: {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        subscriptionPlan: user.subscriptionPlan,
        isEmailVerified: user.isEmailVerified
      },
      token
    }
  });
}));

// Login user
router.post('/login', validateLogin, handleValidationErrors, catchAsync(async (req, res) => {
  const { email, password } = req.body;

  // Find user and include password for comparison
  const user = await User.findOne({ email }).select('+passwordHash');
  
  if (!user || !await user.comparePassword(password)) {
    logger.logSecurityEvent('failed_login_attempt', null, { email, ip: req.ip });
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  if (!user.isActive) {
    throw new AppError('Account is deactivated', 401, 'ACCOUNT_DEACTIVATED');
  }

  // Update last login
  user.lastLoginAt = new Date();
  await user.save();

  // Generate JWT token
  const token = generateToken(user._id);

  // Log successful login
  logger.info('User logged in', {
    userId: user._id,
    email: user.email,
    ip: req.ip
  });

  res.json({
    status: 'success',
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        subscriptionPlan: user.subscriptionPlan,
        subscriptionStatus: user.subscriptionStatus,
        isEmailVerified: user.isEmailVerified,
        lastLoginAt: user.lastLoginAt
      },
      token
    }
  });
}));

// Forgot password
router.post('/forgot-password', validateForgotPassword, handleValidationErrors, catchAsync(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    // Don't reveal if email exists or not
    return res.json({
      status: 'success',
      message: 'If an account with that email exists, a password reset link has been sent'
    });
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  await user.save();

  // Log password reset request
  logger.logSecurityEvent('password_reset_requested', user._id, { email });

  // TODO: Send email with reset link
  // For now, just return success (in production, implement email service)
  
  res.json({
    status: 'success',
    message: 'Password reset link sent to your email',
    // In development, include the token for testing
    ...(process.env.NODE_ENV === 'development' && { resetToken })
  });
}));

// Reset password
router.post('/reset-password', validateResetPassword, handleValidationErrors, catchAsync(async (req, res) => {
  const { token, password } = req.body;

  // Hash the token to compare with stored hash
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    throw new AppError('Token is invalid or has expired', 400, 'INVALID_TOKEN');
  }

  // Update password
  user.passwordHash = password; // Will be hashed by pre-save middleware
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;

  await user.save();

  // Generate new JWT token
  const jwtToken = generateToken(user._id);

  // Log password reset
  logger.logSecurityEvent('password_reset_completed', user._id);

  res.json({
    status: 'success',
    message: 'Password reset successful',
    data: {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      },
      token: jwtToken
    }
  });
}));

// Verify email
router.post('/verify-email', catchAsync(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    throw new AppError('Verification token is required', 400, 'TOKEN_REQUIRED');
  }

  const user = await User.findOne({ emailVerificationToken: token });
  
  if (!user) {
    throw new AppError('Invalid verification token', 400, 'INVALID_TOKEN');
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = null;
  await user.save();

  logger.info('Email verified', { userId: user._id, email: user.email });

  res.json({
    status: 'success',
    message: 'Email verified successfully'
  });
}));

// Resend verification email
router.post('/resend-verification', catchAsync(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new AppError('Email is required', 400, 'EMAIL_REQUIRED');
  }

  const user = await User.findOne({ email });
  
  if (!user) {
    // Don't reveal if email exists or not
    return res.json({
      status: 'success',
      message: 'If an account with that email exists and is unverified, a verification email has been sent'
    });
  }

  if (user.isEmailVerified) {
    return res.json({
      status: 'success',
      message: 'Email is already verified'
    });
  }

  // Generate new verification token
  user.emailVerificationToken = crypto.randomBytes(32).toString('hex');
  await user.save();

  // TODO: Send verification email
  // For now, just return success (in production, implement email service)

  res.json({
    status: 'success',
    message: 'Verification email sent',
    // In development, include the token for testing
    ...(process.env.NODE_ENV === 'development' && { verificationToken: user.emailVerificationToken })
  });
}));

export default router;
