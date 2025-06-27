// backend/src/middleware/correlationId.js
// Middleware to generate correlation IDs for request tracking

const { v4: uuidv4 } = require("uuid");

/**
 * Middleware to add correlation ID to each request
 * This helps track requests across logs and services
 */
const correlationIdMiddleware = (req, res, next) => {
  // Generate unique correlation ID
  req.correlationId = uuidv4();

  // Add correlation ID to response headers for client tracking
  res.setHeader("X-Correlation-ID", req.correlationId);

  // Add correlation ID to request object for logging
  req.requestId = req.correlationId;

  next();
};

module.exports = correlationIdMiddleware;
