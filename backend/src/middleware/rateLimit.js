// backend/src/middleware/rateLimit.js
// Rate limiting middleware for protection against abuse and DDoS

const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit of 100 requests per IP
  standardHeaders: true, // Add standard headers
  legacyHeaders: false, // Remove old headers
  message: {
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many requests, please try again later.",
    },
  },
});

module.exports = limiter;
