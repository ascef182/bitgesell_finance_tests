// backend/src/utils/cache.js
// Redis cache service with fallback to local memory

const redis = require("redis");

// In-memory cache as fallback
const memoryCache = new Map();
const CACHE_TTL = 60; // Default cache TTL (seconds)

let client = null;
let redisAvailable = false;

// Try to connect to Redis
const initializeRedis = async () => {
  try {
    client = redis.createClient();
    client.on("error", (err) => {
      console.warn("Redis not available, using memory cache:", err.message);
      redisAvailable = false;
    });
    await client.connect();
    redisAvailable = true;
    console.log("✅ Redis connected successfully");
  } catch (err) {
    console.warn("Redis not available, using memory cache:", err.message);
    redisAvailable = false;
  }
};

// Initialize Redis on import
initializeRedis();

/**
 * Get value from cache (Redis or memory)
 * @param {string} key
 * @returns {Promise<any|null>}
 */
const getCache = async (key) => {
  try {
    if (redisAvailable && client) {
      const data = await client.get(key);
      return data ? JSON.parse(data) : null;
    } else {
      // Fallback to memory
      const cached = memoryCache.get(key);
      if (cached && Date.now() < cached.expiry) {
        return cached.value;
      }
      memoryCache.delete(key);
      return null;
    }
  } catch (err) {
    console.error("Cache get error:", err);
    return null;
  }
};

/**
 * Set value in cache (Redis or memory)
 * @param {string} key
 * @param {any} value
 * @param {number} ttl
 */
const setCache = async (key, value, ttl = CACHE_TTL) => {
  try {
    if (redisAvailable && client) {
      await client.setEx(key, ttl, JSON.stringify(value));
    } else {
      // Fallback to memory
      memoryCache.set(key, {
        value,
        expiry: Date.now() + ttl * 1000,
      });
    }
  } catch (err) {
    console.error("Cache set error:", err);
  }
};

/**
 * Invalidate/remove key from cache (Redis or memory)
 * @param {string} key
 */
const invalidateCache = async (key) => {
  try {
    if (redisAvailable && client) {
      // Wildcard support: if key ends with *, delete all keys that start the same
      if (key.endsWith("*")) {
        const pattern = key;
        const keys = await client.keys(pattern);
        if (keys.length > 0) {
          await client.del(keys);
        }
      } else {
        await client.del(key);
      }
    } else {
      // Fallback to memory
      if (key.endsWith("*")) {
        const prefix = key.slice(0, -1);
        for (const [k] of memoryCache) {
          if (k.startsWith(prefix)) {
            memoryCache.delete(k);
          }
        }
      } else {
        memoryCache.delete(key);
      }
    }
  } catch (err) {
    console.error("Cache invalidate error:", err);
  }
};

/**
 * Clear all cache (useful for tests)
 */
const clearCache = async () => {
  try {
    if (redisAvailable && client) {
      await client.flushDb();
    } else {
      memoryCache.clear();
    }
  } catch (err) {
    console.error("Cache clear error:", err);
  }
};

module.exports = {
  getCache,
  setCache,
  invalidateCache,
  clearCache,
};
