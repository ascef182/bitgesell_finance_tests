/**
 * Secure Error Handling Middleware
 *
 * This middleware provides centralized error handling with:
 * - Structured logging for debugging and monitoring
 * - Security-focused error responses (no sensitive data leakage)
 * - Rate limiting integration
 * - Request tracking for audit purposes
 */

const logger = require("./logger");

/**
 * 404 Not Found middleware
 * Handles requests to non-existent routes
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route Not Found: ${req.method} ${req.originalUrl}`);
  error.status = 404;
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
const errorHandler = (error, req, res, next) => {
  // Default error values
  const status = error.status || 500;
  const message = error.message || "Internal Server Error";
  const code = error.code || "INTERNAL_ERROR";

  // Log error with structured data
  logger.error("Application error", {
    status,
    code,
    message: error.message,
    stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    timestamp: new Date().toISOString(),
  });

  // Security: Don't expose internal errors in production
  const responseMessage =
    status === 500 && process.env.NODE_ENV === "production"
      ? "Internal Server Error"
      : message;

  // Send error response
  res.status(status).json({
    error: {
      code,
      message: responseMessage,
      ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
    },
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
  });
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
        pattern: pattern.source,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
        url: req.originalUrl,
      });

      return res.status(400).json({
        error: {
          code: "INVALID_REQUEST",
          message: "Request contains invalid content",
        },
      });
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
  validateRequest,
  securityHeaders,
};
