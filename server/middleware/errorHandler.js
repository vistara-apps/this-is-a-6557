import logger from '../utils/logger.js';

// Custom error class
export class AppError extends Error {
  constructor(message, statusCode, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// MongoDB duplicate key error handler
const handleDuplicateKeyError = (error) => {
  const field = Object.keys(error.keyValue)[0];
  const value = error.keyValue[field];
  const message = `${field} '${value}' already exists`;
  return new AppError(message, 400, 'DUPLICATE_KEY');
};

// MongoDB validation error handler
const handleValidationError = (error) => {
  const errors = Object.values(error.errors).map(err => err.message);
  const message = `Validation failed: ${errors.join(', ')}`;
  return new AppError(message, 400, 'VALIDATION_ERROR');
};

// MongoDB cast error handler
const handleCastError = (error) => {
  const message = `Invalid ${error.path}: ${error.value}`;
  return new AppError(message, 400, 'INVALID_ID');
};

// JWT error handler
const handleJWTError = () => {
  return new AppError('Invalid token', 401, 'INVALID_TOKEN');
};

// JWT expired error handler
const handleJWTExpiredError = () => {
  return new AppError('Token expired', 401, 'TOKEN_EXPIRED');
};

// Send error response in development
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: 'error',
    error: err,
    message: err.message,
    code: err.code,
    stack: err.stack
  });
};

// Send error response in production
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      code: err.code
    });
  } else {
    // Programming or other unknown error: don't leak error details
    logger.error('ERROR:', err);
    
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
      code: 'INTERNAL_ERROR'
    });
  }
};

// Main error handling middleware
export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    // Handle specific error types
    if (error.code === 11000) error = handleDuplicateKeyError(error);
    if (error.name === 'ValidationError') error = handleValidationError(error);
    if (error.name === 'CastError') error = handleCastError(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};

// Async error wrapper
export const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

// 404 handler
export const notFound = (req, res, next) => {
  const err = new AppError(`Route ${req.originalUrl} not found`, 404, 'NOT_FOUND');
  next(err);
};

// Validation error helper
export const validationError = (message, field = null) => {
  const code = field ? `INVALID_${field.toUpperCase()}` : 'VALIDATION_ERROR';
  return new AppError(message, 400, code);
};

// Authorization error helper
export const authorizationError = (message = 'Not authorized') => {
  return new AppError(message, 403, 'AUTHORIZATION_ERROR');
};

// Not found error helper
export const notFoundError = (resource = 'Resource') => {
  return new AppError(`${resource} not found`, 404, 'NOT_FOUND');
};

// Rate limit error helper
export const rateLimitError = (message = 'Too many requests') => {
  return new AppError(message, 429, 'RATE_LIMIT_EXCEEDED');
};

// Subscription error helper
export const subscriptionError = (message = 'Active subscription required') => {
  return new AppError(message, 402, 'SUBSCRIPTION_REQUIRED');
};

export default {
  AppError,
  errorHandler,
  catchAsync,
  notFound,
  validationError,
  authorizationError,
  notFoundError,
  rateLimitError,
  subscriptionError
};
