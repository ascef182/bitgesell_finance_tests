// backend/src/middleware/rateLimit.js
// Middleware de rate limiting para proteção contra abuso e DDoS

const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limite de 100 requisições por IP
  standardHeaders: true, // Adiciona headers padrão
  legacyHeaders: false, // Remove headers antigos
  message: {
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many requests, please try again later.",
    },
  },
});

module.exports = limiter;
