const express = require("express");
const path = require("path");
const morgan = require("morgan");
const itemsRouter = require("./routes/items");
const statsRouter = require("./routes/stats");
const cors = require("cors");

// Import secure middleware
const {
  notFound,
  errorHandler,
  validateRequest,
  securityHeaders,
} = require("./middleware/errorHandler");
const { requestLogger, errorLogger } = require("./middleware/logger");

const app = express();
const port = process.env.PORT || 3001;

// Security middleware (apply first)
app.use(securityHeaders);

// CORS configuration with security restrictions
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://yourdomain.com"] // Replace with actual domain
        : ["http://localhost:3000"],
    credentials: false, // Disable credentials for security
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Request parsing middleware
app.use(express.json({ limit: "10mb" })); // Limit payload size
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logging middleware
app.use(requestLogger);
app.use(morgan("combined")); // Use combined format for better security

// Request validation middleware
app.use(validateRequest);

// API Routes
app.use("/api/items", itemsRouter);
app.use("/api/stats", statsRouter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

// 404 handler
app.use("*", notFound);

// Error logging middleware
app.use(errorLogger);

// Global error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(port, () => {
  console.log(`🚀 Backend server running on http://localhost:${port}`);
  console.log(`📊 Health check available at http://localhost:${port}/health`);
  console.log(`🔒 Security headers and validation enabled`);
});
