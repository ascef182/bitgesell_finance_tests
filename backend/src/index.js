const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const responseTime = require("response-time");

// Import middlewares
const correlationIdMiddleware = require("./middleware/correlationId");
const requestLogger = require("./middleware/logger");
const {
  errorHandler,
  validateRequest,
  notFound,
} = require("./middleware/errorHandler");
const rateLimiter = require("./middleware/rateLimit");
const { metricsMiddleware, getMetrics } = require("./utils/metrics");

// Import routes
const itemsRouter = require("./routes/items");
const statsRouter = require("./routes/stats");

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// Request parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Correlation ID middleware (must be first)
app.use(correlationIdMiddleware);

// Performance monitoring
app.use(responseTime());
app.use(metricsMiddleware);

// Request logging
app.use(requestLogger);

// Rate limiting global
app.use(rateLimiter);

// Request validation
app.use(validateRequest);

// API Routes
app.use("/api/items", itemsRouter);
app.use("/api/stats", statsRouter);

// Favicon route to prevent 404 errors in browser
app.get("/favicon.ico", (req, res) => {
  res.status(204).end(); // No Content
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    correlationId: req.correlationId,
  });
});

// Metrics endpoint for Prometheus
app.get("/metrics", getMetrics);

// 404 handler
app.use(notFound);

// Global error handler (must be last)
app.use(errorHandler);

// Start server only if this file is run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(` Server running on port ${PORT}`);
    console.log(` Metrics available at http://localhost:${PORT}/metrics`);
    console.log(` Health check at http://localhost:${PORT}/health`);
  });
}

module.exports = app;
