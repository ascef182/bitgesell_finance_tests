/**
 * Structured Logging Middleware
 *
 * Provides centralized logging with:
 * - Different log levels (info, warn, error, debug)
 * - Structured JSON output for better parsing
 * - Request tracking with unique IDs
 * - Security-focused logging (no sensitive data)
 * - Performance metrics
 */

/**
 * Generate a unique request ID for tracking
 */
const generateRequestId = () => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Sanitize sensitive data from logs
 */
const sanitizeData = (data) => {
  if (typeof data !== "object" || data === null) {
    return data;
  }

  const sensitiveFields = [
    "password",
    "token",
    "secret",
    "key",
    "authorization",
  ];
  const sanitized = { ...data };

  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = "[REDACTED]";
    }
  }

  return sanitized;
};

/**
 * Format log entry with consistent structure
 */
const formatLog = (level, message, data = {}) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: level.toUpperCase(),
    message,
    ...sanitizeData(data),
  };

  // In development, use console.log for better readability
  if (process.env.NODE_ENV === "development") {
    console.log(
      `[${logEntry.timestamp}] ${logEntry.level}: ${logEntry.message}`,
      data
    );
  } else {
    // In production, use JSON format for log aggregation
    console.log(JSON.stringify(logEntry));
  }
};

/**
 * Logger object with different log levels
 */
const logger = {
  info: (message, data) => formatLog("info", message, data),
  warn: (message, data) => formatLog("warn", message, data),
  error: (message, data) => formatLog("error", message, data),
  debug: (message, data) => {
    if (process.env.NODE_ENV === "development") {
      formatLog("debug", message, data);
    }
  },
};

/**
 * Request logging middleware
 * Logs all incoming requests with performance metrics
 */
const requestLogger = (req, res, next) => {
  // Generate unique request ID
  req.requestId = generateRequestId();

  // Add request ID to response headers
  res.setHeader("X-Request-ID", req.requestId);

  // Capture start time for performance measurement
  const startTime = Date.now();

  // Log incoming request
  logger.info("Incoming request", {
    requestId: req.requestId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    query: req.query,
    body: req.body,
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function (chunk, encoding) {
    const duration = Date.now() - startTime;

    // Log response
    logger.info("Request completed", {
      requestId: req.requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get("Content-Length") || 0,
    });

    // Call original end method
    originalEnd.call(this, chunk, encoding);
  };

  next();
};

/**
 * Error logging middleware
 * Logs errors with additional context
 */
const errorLogger = (error, req, res, next) => {
  logger.error("Request error", {
    requestId: req.requestId,
    method: req.method,
    url: req.originalUrl,
    error: {
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      code: error.code,
      status: error.status,
    },
  });

  next(error);
};

module.exports = {
  logger,
  requestLogger,
  errorLogger,
};
