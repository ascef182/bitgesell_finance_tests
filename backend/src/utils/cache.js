// backend/src/utils/cache.js
// Serviço de cache Redis com fallback para memória local

const redis = require("redis");

// Cache em memória como fallback
const memoryCache = new Map();
const CACHE_TTL = 60; // Tempo de vida padrão do cache (segundos)

let client = null;
let redisAvailable = false;

// Tenta conectar ao Redis
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

// Inicializa Redis na importação
initializeRedis();

/**
 * Obtém valor do cache (Redis ou memória)
 * @param {string} key
 * @returns {Promise<any|null>}
 */
const getCache = async (key) => {
  try {
    if (redisAvailable && client) {
      const data = await client.get(key);
      return data ? JSON.parse(data) : null;
    } else {
      // Fallback para memória
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
 * Define valor no cache (Redis ou memória)
 * @param {string} key
 * @param {any} value
 * @param {number} ttl
 */
const setCache = async (key, value, ttl = CACHE_TTL) => {
  try {
    if (redisAvailable && client) {
      await client.setEx(key, ttl, JSON.stringify(value));
    } else {
      // Fallback para memória
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
 * Invalida/remove chave do cache (Redis ou memória)
 * @param {string} key
 */
const invalidateCache = async (key) => {
  try {
    if (redisAvailable && client) {
      // Suporte a wildcard: se key termina com *, deleta todas as chaves que começam igual
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
      // Fallback para memória
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
 * Limpa todo o cache (útil para testes)
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
