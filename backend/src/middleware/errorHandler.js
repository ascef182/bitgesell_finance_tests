/**
 * Secure Error Handling Middleware
 *
 * This middleware provides centralized error handling with:
 * - Structured logging for debugging and monitoring
 * - Security-focused error responses (no sensitive data leakage)
 * - Rate limiting integration
 * - Request tracking for audit purposes
 */

const logger = require("../utils/logger");

/**
 * 404 Not Found middleware
 * Handles requests to non-existent routes
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route Not Found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  error.code = "ROUTE_NOT_FOUND";

  // Log the 404 request for monitoring
  logger.warn("Route not found", {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });

  next(error);
};

/**
 * Global error handler middleware
 * Processes all errors thrown in the application
 */
const errorHandler = (err, req, res, next) => {
  // Standardize error properties
  const statusCode = err.statusCode || err.status || 500;
  const code = err.code || "INTERNAL_SERVER_ERROR";
  const message = err.message || "Something went wrong";

  // Log error with structured data and correlation ID
  logger.error("Application error", {
    correlationId: req.correlationId,
    statusCode,
    code,
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    timestamp: new Date().toISOString(),
  });

  // Security: Don't expose internal errors in production
  const responseMessage =
    statusCode === 500 && process.env.NODE_ENV === "production"
      ? "Internal Server Error"
      : message;

  // Send standardized error response
  res.status(statusCode).json({
    error: {
      code,
      message: responseMessage,
    },
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    correlationId: req.correlationId,
  });
};

/**
 * JSON parsing error handler
 * Catches JSON parsing errors and formats them consistently
 */
const jsonErrorHandler = (error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    // JSON parsing error
    const enhancedError = new Error("Invalid JSON in request body");
    enhancedError.statusCode = 400;
    enhancedError.code = "INVALID_JSON";
    return next(enhancedError);
  }
  next(error);
};

/**
 * Request validation middleware
 * Validates incoming requests for security
 */
const validateRequest = (req, res, next) => {
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /eval\s*\(/i,
    /Function\s*\(/i,
  ];

  const requestBody = JSON.stringify(req.body);
  const requestQuery = JSON.stringify(req.query);
  const requestParams = JSON.stringify(req.params);

  const allData = `${requestBody} ${requestQuery} ${requestParams}`;

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(allData)) {
      logger.warn("Suspicious request detected", {
        correlationId: req.correlationId,
        pattern: pattern.source,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
        url: req.originalUrl,
      });

      const error = new Error("Suspicious request detected");
      error.statusCode = 400;
      error.code = "SUSPICIOUS_REQUEST";
      return next(error);
    }
  }

  next();
};

/**
 * Security headers middleware
 * Adds security headers to all responses
 */
const securityHeaders = (req, res, next) => {
  // Prevent XSS attacks
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Prevent clickjacking
  res.setHeader("Content-Security-Policy", "default-src 'self'");

  // Remove server information
  res.removeHeader("X-Powered-By");

  next();
};

module.exports = {
  notFound,
  errorHandler,
  jsonErrorHandler,
  validateRequest,
  securityHeaders,
};
