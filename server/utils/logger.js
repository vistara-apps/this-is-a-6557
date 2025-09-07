import winston from 'winston';
import path from 'path';

const { combine, timestamp, errors, json, printf, colorize } = winston.format;

// Custom format for console output
const consoleFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    json()
  ),
  defaultMeta: { service: 'socialsync-ai' },
  transports: [
    // Write all logs with importance level of 'error' or less to error.log
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Write all logs with importance level of 'info' or less to combined.log
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// If we're not in production, log to the console with a simple format
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: combine(
      colorize(),
      timestamp({ format: 'HH:mm:ss' }),
      consoleFormat
    )
  }));
}

// Create logs directory if it doesn't exist
import fs from 'fs';
const logsDir = 'logs';
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Helper methods for structured logging
logger.logRequest = (req, res, responseTime) => {
  logger.info('HTTP Request', {
    method: req.method,
    url: req.url,
    statusCode: res.statusCode,
    responseTime: `${responseTime}ms`,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    userId: req.userId || null
  });
};

logger.logError = (error, req = null) => {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    name: error.name
  };

  if (req) {
    errorInfo.request = {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
      userId: req.userId || null
    };
  }

  logger.error('Application Error', errorInfo);
};

logger.logSocialMediaAction = (action, platform, userId, details = {}) => {
  logger.info('Social Media Action', {
    action,
    platform,
    userId,
    ...details,
    timestamp: new Date().toISOString()
  });
};

logger.logSubscriptionEvent = (event, userId, subscriptionData = {}) => {
  logger.info('Subscription Event', {
    event,
    userId,
    ...subscriptionData,
    timestamp: new Date().toISOString()
  });
};

logger.logAIRequest = (type, userId, prompt, response, cost = null) => {
  logger.info('AI Request', {
    type,
    userId,
    promptLength: prompt?.length || 0,
    responseLength: response?.length || 0,
    cost,
    timestamp: new Date().toISOString()
  });
};

logger.logSecurityEvent = (event, userId, details = {}) => {
  logger.warn('Security Event', {
    event,
    userId,
    ...details,
    timestamp: new Date().toISOString()
  });
};

export default logger;
