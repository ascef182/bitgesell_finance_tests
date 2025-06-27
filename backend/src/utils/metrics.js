// backend/src/utils/metrics.js
// Prometheus metrics for application monitoring

const client = require("prom-client");

// Enable default metrics collection
client.collectDefaultMetrics();

// Custom metrics
const httpRequestDurationMicroseconds = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.1, 0.5, 1, 2, 5],
});

const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
});

const activeConnections = new client.Gauge({
  name: "http_active_connections",
  help: "Number of active HTTP connections",
});

// Middleware to collect metrics
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();

  // Increment active connections
  activeConnections.inc();

  // Override res.end to collect metrics
  const originalEnd = res.end;
  res.end = function (chunk, encoding) {
    const duration = (Date.now() - start) / 1000; // Convert to seconds
    const route = req.route ? req.route.path : req.path;

    // Record metrics
    httpRequestDurationMicroseconds
      .labels(req.method, route, res.statusCode.toString())
      .observe(duration);

    httpRequestsTotal
      .labels(req.method, route, res.statusCode.toString())
      .inc();

    // Decrement active connections
    activeConnections.dec();

    // Call original end method
    originalEnd.call(this, chunk, encoding);
  };

  next();
};

// Metrics endpoint
const getMetrics = async (req, res) => {
  try {
    res.set("Content-Type", client.register.contentType);
    const metrics = await client.register.metrics();
    res.end(metrics);
  } catch (error) {
    res.status(500).json({ error: "Failed to collect metrics" });
  }
};

module.exports = {
  metricsMiddleware,
  getMetrics,
  client,
};
