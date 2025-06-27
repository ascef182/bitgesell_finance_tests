const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const responseTime = require("response-time");
const swaggerUi = require("swagger-ui-express");

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

// Import Swagger specs
const swaggerSpecs = require("./utils/swagger");

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

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Check the health and status of the API
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is healthy and running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "OK"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-06-27T16:00:00.000Z"
 *                 uptime:
 *                   type: number
 *                   description: Server uptime in seconds
 *                   example: 3600.5
 *                 environment:
 *                   type: string
 *                   example: "development"
 *                 correlationId:
 *                   type: string
 *                   description: Request correlation ID
 *                   example: "550e8400-e29b-41d4-a716-446655440000"
 *             example:
 *               status: "OK"
 *               timestamp: "2025-06-27T16:00:00.000Z"
 *               uptime: 3600.5
 *               environment: "development"
 *               correlationId: "550e8400-e29b-41d4-a716-446655440000"
 *       429:
 *         $ref: '#/components/responses/RateLimitExceeded'
 */
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

/**
 * @swagger
 * /metrics:
 *   get:
 *     summary: Prometheus metrics endpoint
 *     description: Get Prometheus-compatible metrics for monitoring
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Prometheus metrics in text format
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *             example: |
 *               # HELP http_requests_total Total number of HTTP requests
 *               # TYPE http_requests_total counter
 *               http_requests_total{method="GET",route="/api/items",status_code="200"} 42
 *               # HELP http_request_duration_seconds Duration of HTTP requests in seconds
 *               # TYPE http_request_duration_seconds histogram
 *               http_request_duration_seconds_bucket{method="GET",route="/api/items",status_code="200",le="0.1"} 35
 *       429:
 *         $ref: '#/components/responses/RateLimitExceeded'
 *       500:
 *         description: Failed to collect metrics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Failed to collect metrics"
 */
// Metrics endpoint for Prometheus
app.get("/metrics", getMetrics);

/**
 * @swagger
 * /api-docs:
 *   get:
 *     summary: API Documentation
 *     description: Interactive API documentation with Swagger UI
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Swagger UI interface
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 */
// Swagger UI for API documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpecs, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Items API Documentation",
    customfavIcon: "/favicon.ico",
    swaggerOptions: {
      docExpansion: "list",
      filter: true,
      showRequestHeaders: true,
      tryItOutEnabled: true,
    },
  })
);

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
    console.log(` API Documentation at http://localhost:${PORT}/api-docs`);
  });
}

module.exports = app;
