const fs = require("fs").promises;
const path = require("path");

/**
 * File Utilities for Async Operations
 *
 * This module provides async file operations with:
 * - Proper error handling and logging
 * - Retry logic for transient failures
 * - Performance monitoring
 * - Data validation
 */

/**
 * Read JSON file asynchronously with error handling
 * @param {string} filePath - Path to the JSON file
 * @param {Object} options - Options for reading
 * @returns {Promise<Object>} Parsed JSON data
 */
async function readJsonFile(filePath, options = {}) {
  const {
    encoding = "utf8",
    maxRetries = 3,
    retryDelay = 1000,
    validateData = true,
  } = options;

  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Read file asynchronously
      const rawData = await fs.readFile(filePath, encoding);

      // Parse JSON data
      const data = JSON.parse(rawData);

      // Validate data structure if requested
      if (validateData && !Array.isArray(data)) {
        throw new Error("Invalid data format: expected array");
      }

      return data;
    } catch (error) {
      lastError = error;

      // Handle specific error types
      if (error.code === "ENOENT") {
        throw new Error(`File not found: ${filePath}`);
      }

      if (error instanceof SyntaxError) {
        throw new Error(`Invalid JSON in file: ${filePath}`);
      }

      // Retry for transient errors (like EACCES, EBUSY)
      if (attempt < maxRetries && isRetryableError(error)) {
        console.warn(
          `File read attempt ${attempt} failed, retrying in ${retryDelay}ms:`,
          error.message
        );
        await delay(retryDelay * attempt); // Exponential backoff
        continue;
      }

      // Don't retry for non-retryable errors
      break;
    }
  }

  throw new Error(
    `Failed to read file after ${maxRetries} attempts: ${lastError.message}`
  );
}

/**
 * Write JSON file asynchronously with error handling
 * @param {string} filePath - Path to the JSON file
 * @param {Object} data - Data to write
 * @param {Object} options - Options for writing
 * @returns {Promise<void>}
 */
async function writeJsonFile(filePath, data, options = {}) {
  const {
    encoding = "utf8",
    maxRetries = 3,
    retryDelay = 1000,
    prettyPrint = true,
  } = options;

  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Ensure directory exists
      const dir = path.dirname(filePath);
      await fs.mkdir(dir, { recursive: true });

      // Stringify data
      const jsonString = prettyPrint
        ? JSON.stringify(data, null, 2)
        : JSON.stringify(data);

      // Write file asynchronously
      await fs.writeFile(filePath, jsonString, encoding);

      return;
    } catch (error) {
      lastError = error;

      // Handle specific error types
      if (error.code === "ENOSPC") {
        throw new Error("No space left on device");
      }

      if (error.code === "EACCES") {
        throw new Error(`Permission denied: ${filePath}`);
      }

      // Retry for transient errors
      if (attempt < maxRetries && isRetryableError(error)) {
        console.warn(
          `File write attempt ${attempt} failed, retrying in ${retryDelay}ms:`,
          error.message
        );
        await delay(retryDelay * attempt);
        continue;
      }

      break;
    }
  }

  throw new Error(
    `Failed to write file after ${maxRetries} attempts: ${lastError.message}`
  );
}

/**
 * Check if file exists asynchronously
 * @param {string} filePath - Path to check
 * @returns {Promise<boolean>} True if file exists
 */
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get file stats asynchronously
 * @param {string} filePath - Path to the file
 * @returns {Promise<Object>} File stats
 */
async function getFileStats(filePath) {
  try {
    return await fs.stat(filePath);
  } catch (error) {
    throw new Error(`Failed to get file stats: ${error.message}`);
  }
}

/**
 * Determine if an error is retryable
 * @param {Error} error - Error to check
 * @returns {boolean} True if error is retryable
 */
function isRetryableError(error) {
  const retryableCodes = [
    "EBUSY", // File is busy
    "EACCES", // Permission denied (temporary)
    "ENOTEMPTY", // Directory not empty
    "ETIMEDOUT", // Operation timed out
    "ECONNRESET", // Connection reset
  ];

  return retryableCodes.includes(error.code);
}

/**
 * Delay execution for specified milliseconds
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise<void>}
 */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Validate JSON data structure
 * @param {Object} data - Data to validate
 * @param {Object} schema - Expected schema
 * @returns {boolean} True if valid
 */
function validateJsonStructure(data, schema = {}) {
  if (schema.type === "array" && !Array.isArray(data)) {
    return false;
  }

  if (
    schema.type === "object" &&
    (typeof data !== "object" || Array.isArray(data))
  ) {
    return false;
  }

  return true;
}

module.exports = {
  readJsonFile,
  writeJsonFile,
  fileExists,
  getFileStats,
  validateJsonStructure,
};
