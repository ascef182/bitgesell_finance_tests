const express = require("express");
const path = require("path");
const router = express.Router();

// Import async file utilities
const {
  readJsonFile,
  writeJsonFile,
  fileExists,
} = require("../utils/fileUtils");

// Import cache utilities
const { getCache, setCache, invalidateCache } = require("../utils/cache");

// Import logger
const logger = require("../utils/logger");

// Data file path
const DATA_PATH = path.join(__dirname, "../../../data/items.json");

/**
 * Async utility to read items data with error handling
 * @returns {Promise<Array>} Array of items
 */
async function readItemsData() {
  try {
    // Check if file exists first
    if (!(await fileExists(DATA_PATH))) {
      const error = new Error("Items data file not found");
      error.statusCode = 404;
      error.code = "DATA_READ_ERROR";
      throw error;
    }

    // Read and parse JSON data asynchronously
    const data = await readJsonFile(DATA_PATH, {
      validateData: true,
      maxRetries: 2,
    });

    return data;
  } catch (error) {
    // Log error for debugging
    logger.error("Error reading items data", {
      error: error.message,
      filePath: DATA_PATH,
    });

    // Re-throw with appropriate status code
    const enhancedError = new Error(
      `Failed to read items data: ${error.message}`
    );
    enhancedError.statusCode =
      error.statusCode || error.status || (error.code === "ENOENT" ? 404 : 500);
    enhancedError.code = error.code || "DATA_READ_ERROR";

    throw enhancedError;
  }
}

/**
 * Async utility to write items data with error handling
 * @param {Array} data - Items data to write
 * @returns {Promise<void>}
 */
async function writeItemsData(data) {
  try {
    await writeJsonFile(DATA_PATH, data, {
      prettyPrint: true,
      maxRetries: 2,
    });
  } catch (error) {
    // Log error for debugging
    logger.error("Error writing items data", {
      error: error.message,
      filePath: DATA_PATH,
    });

    const enhancedError = new Error(
      `Failed to write items data: ${error.message}`
    );
    enhancedError.statusCode = 500;
    enhancedError.code = "DATA_WRITE_ERROR";

    throw enhancedError;
  }
}

/**
 * @swagger
 * /api/items:
 *   get:
 *     summary: Get all items
 *     description: Retrieve a list of all items with optional filtering and pagination
 *     tags: [Items]
 *     parameters:
 *       - $ref: '#/components/parameters/SearchQuery'
 *       - $ref: '#/components/parameters/Limit'
 *     responses:
 *       200:
 *         description: List of items retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ItemList'
 *             example:
 *               items:
 *                 - id: 1
 *                   name: "Laptop"
 *                   category: "Electronics"
 *                   price: 999.99
 *                   createdAt: "2025-06-27T16:00:00.000Z"
 *                   updatedAt: "2025-06-27T16:30:00.000Z"
 *                 - id: 2
 *                   name: "Headphones"
 *                   category: "Electronics"
 *                   price: 199.99
 *                   createdAt: "2025-06-27T16:00:00.000Z"
 *                   updatedAt: null
 *               total: 2
 *               timestamp: "2025-06-27T16:00:00.000Z"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         description: Items data file not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error:
 *                 code: "DATA_READ_ERROR"
 *                 message: "Failed to read items data: Items data file not found"
 *               timestamp: "2025-06-27T16:00:00.000Z"
 *               path: "/api/items"
 *               correlationId: "550e8400-e29b-41d4-a716-446655440000"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *       429:
 *         $ref: '#/components/responses/RateLimitExceeded'
 */
// GET /api/items com cache Redis
router.get("/", async (req, res, next) => {
  const cacheKey = `items::${req.originalUrl}`;

  // Tenta buscar do cache
  const cached = await getCache(cacheKey);
  if (cached) {
    logger.info("Cache hit for items", {
      correlationId: req.correlationId,
      cacheKey,
    });
    return res.json(cached);
  }

  try {
    // Read data asynchronously
    const data = await readItemsData();

    const { limit, q } = req.query;
    let results = data;

    // Apply search filter if query parameter provided
    if (q && q.trim()) {
      const searchTerm = q.trim().toLowerCase();
      results = results.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm) ||
          (item.category && item.category.toLowerCase().includes(searchTerm))
      );
    }

    // Apply limit if provided
    if (limit) {
      const limitNum = parseInt(limit);
      if (isNaN(limitNum) || limitNum < 1) {
        const error = new Error("Invalid limit parameter");
        error.statusCode = 400;
        error.code = "INVALID_LIMIT";
        throw error;
      }
      results = results.slice(0, limitNum);
    }

    const response = {
      items: results,
      total: results.length,
      timestamp: new Date().toISOString(),
    };

    // Cache the response
    await setCache(cacheKey, response);

    logger.info("Items retrieved successfully", {
      correlationId: req.correlationId,
      totalItems: results.length,
      hasSearch: !!q,
      hasLimit: !!limit,
    });

    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/items/{id}:
 *   get:
 *     summary: Get item by ID
 *     description: Retrieve a specific item by its unique identifier
 *     tags: [Items]
 *     parameters:
 *       - $ref: '#/components/parameters/ItemId'
 *     responses:
 *       200:
 *         description: Item retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Item'
 *             example:
 *               id: 1
 *               name: "Laptop"
 *               category: "Electronics"
 *               price: 999.99
 *               createdAt: "2025-06-27T16:00:00.000Z"
 *               updatedAt: "2025-06-27T16:30:00.000Z"
 *       400:
 *         description: Invalid item ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error:
 *                 code: "INVALID_ID"
 *                 message: "Invalid item ID"
 *               timestamp: "2025-06-27T16:00:00.000Z"
 *               path: "/api/items/invalid"
 *               correlationId: "550e8400-e29b-41d4-a716-446655440000"
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       429:
 *         $ref: '#/components/responses/RateLimitExceeded'
 */
// GET /api/items/:id
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ID parameter
    const itemId = parseInt(id);
    if (isNaN(itemId) || itemId < 1) {
      const error = new Error("Invalid item ID");
      error.statusCode = 400;
      error.code = "INVALID_ID";
      throw error;
    }

    const data = await readItemsData();
    const item = data.find((item) => item.id === itemId);

    if (!item) {
      const error = new Error(`Item with ID ${itemId} not found`);
      error.statusCode = 404;
      error.code = "ITEM_NOT_FOUND";
      throw error;
    }

    logger.info("Item retrieved successfully", {
      correlationId: req.correlationId,
      itemId,
    });

    res.json(item);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/items:
 *   post:
 *     summary: Create a new item
 *     description: Create a new item with the provided data
 *     tags: [Items]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateItemRequest'
 *           example:
 *             name: "New Laptop"
 *             category: "Electronics"
 *             price: 1299.99
 *     responses:
 *       201:
 *         description: Item created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Item'
 *             example:
 *               id: 3
 *               name: "New Laptop"
 *               category: "Electronics"
 *               price: 1299.99
 *               createdAt: "2025-06-27T16:00:00.000Z"
 *               updatedAt: null
 *       400:
 *         description: Invalid item data or missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               missingName:
 *                 summary: Missing item name
 *                 value:
 *                   error:
 *                     code: "MISSING_NAME"
 *                     message: "Item name is required"
 *                   timestamp: "2025-06-27T16:00:00.000Z"
 *                   path: "/api/items"
 *                   correlationId: "550e8400-e29b-41d4-a716-446655440000"
 *               invalidData:
 *                 summary: Invalid item data
 *                 value:
 *                   error:
 *                     code: "INVALID_ITEM_DATA"
 *                     message: "Invalid item data"
 *                   timestamp: "2025-06-27T16:00:00.000Z"
 *                   path: "/api/items"
 *                   correlationId: "550e8400-e29b-41d4-a716-446655440000"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *       429:
 *         $ref: '#/components/responses/RateLimitExceeded'
 */
// POST /api/items
router.post("/", async (req, res, next) => {
  try {
    const { name, category, price } = req.body;

    // Validate request body
    if (!req.body || Object.keys(req.body).length === 0) {
      const error = new Error("Invalid item data");
      error.statusCode = 400;
      error.code = "INVALID_ITEM_DATA";
      throw error;
    }

    if (!name || name.trim() === "") {
      const error = new Error("Item name is required");
      error.statusCode = 400;
      error.code = "MISSING_NAME";
      throw error;
    }

    const data = await readItemsData();

    // Generate new ID
    const newId = Math.max(...data.map((item) => item.id), 0) + 1;

    const newItem = {
      id: newId,
      name: name.trim(),
      category: category ? category.trim() : null,
      price: price ? parseFloat(price) : null,
      createdAt: new Date().toISOString(),
    };

    data.push(newItem);
    await writeItemsData(data);

    // Invalidate cache
    await invalidateCache("items::*");

    logger.info("Item created successfully", {
      correlationId: req.correlationId,
      itemId: newId,
      itemName: newItem.name,
    });

    res.status(201).json(newItem);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/items/{id}:
 *   put:
 *     summary: Update an existing item
 *     description: Update an existing item with the provided data
 *     tags: [Items]
 *     parameters:
 *       - $ref: '#/components/parameters/ItemId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateItemRequest'
 *           example:
 *             name: "Updated Laptop"
 *             price: 1199.99
 *     responses:
 *       200:
 *         description: Item updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Item'
 *             example:
 *               id: 1
 *               name: "Updated Laptop"
 *               category: "Electronics"
 *               price: 1199.99
 *               createdAt: "2025-06-27T16:00:00.000Z"
 *               updatedAt: "2025-06-27T16:30:00.000Z"
 *       400:
 *         description: Invalid item ID or update data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               invalidId:
 *                 summary: Invalid item ID
 *                 value:
 *                   error:
 *                     code: "INVALID_ID"
 *                     message: "Invalid item ID"
 *                   timestamp: "2025-06-27T16:00:00.000Z"
 *                   path: "/api/items/invalid"
 *                   correlationId: "550e8400-e29b-41d4-a716-446655440000"
 *               invalidUpdate:
 *                 summary: Invalid update data
 *                 value:
 *                   error:
 *                     code: "INVALID_UPDATE_DATA"
 *                     message: "Invalid update data"
 *                   timestamp: "2025-06-27T16:00:00.000Z"
 *                   path: "/api/items/1"
 *                   correlationId: "550e8400-e29b-41d4-a716-446655440000"
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *       429:
 *         $ref: '#/components/responses/RateLimitExceeded'
 */
// PUT /api/items/:id
router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate ID parameter
    const itemId = parseInt(id);
    if (isNaN(itemId) || itemId < 1) {
      const error = new Error("Invalid item ID");
      error.statusCode = 400;
      error.code = "INVALID_ID";
      throw error;
    }

    // Validate update data
    if (!updateData || Object.keys(updateData).length === 0) {
      const error = new Error("Invalid update data");
      error.statusCode = 400;
      error.code = "INVALID_UPDATE_DATA";
      throw error;
    }

    const data = await readItemsData();
    const itemIndex = data.findIndex((item) => item.id === itemId);

    if (itemIndex === -1) {
      const error = new Error(`Item with ID ${itemId} not found`);
      error.statusCode = 404;
      error.code = "ITEM_NOT_FOUND";
      throw error;
    }

    // Update item
    const updatedItem = {
      ...data[itemIndex],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    data[itemIndex] = updatedItem;
    await writeItemsData(data);

    // Invalidate cache
    await invalidateCache("items::*");

    logger.info("Item updated successfully", {
      correlationId: req.correlationId,
      itemId,
      updatedFields: Object.keys(updateData),
    });

    res.json(updatedItem);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/items/{id}:
 *   delete:
 *     summary: Delete an item
 *     description: Delete an existing item by its ID
 *     tags: [Items]
 *     parameters:
 *       - $ref: '#/components/parameters/ItemId'
 *     responses:
 *       200:
 *         description: Item deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                   example: "Item with ID 1 deleted successfully"
 *                 deletedItem:
 *                   $ref: '#/components/schemas/Item'
 *             example:
 *               message: "Item with ID 1 deleted successfully"
 *               deletedItem:
 *                 id: 1
 *                 name: "Laptop"
 *                 category: "Electronics"
 *                 price: 999.99
 *                 createdAt: "2025-06-27T16:00:00.000Z"
 *                 updatedAt: "2025-06-27T16:30:00.000Z"
 *       400:
 *         description: Invalid item ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error:
 *                 code: "INVALID_ID"
 *                 message: "Invalid item ID"
 *               timestamp: "2025-06-27T16:00:00.000Z"
 *               path: "/api/items/invalid"
 *               correlationId: "550e8400-e29b-41d4-a716-446655440000"
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *       429:
 *         $ref: '#/components/responses/RateLimitExceeded'
 */
// DELETE /api/items/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ID parameter
    const itemId = parseInt(id);
    if (isNaN(itemId) || itemId < 1) {
      const error = new Error("Invalid item ID");
      error.statusCode = 400;
      error.code = "INVALID_ID";
      throw error;
    }

    const data = await readItemsData();
    const itemIndex = data.findIndex((item) => item.id === itemId);

    if (itemIndex === -1) {
      const error = new Error(`Item with ID ${itemId} not found`);
      error.statusCode = 404;
      error.code = "ITEM_NOT_FOUND";
      throw error;
    }

    const deletedItem = data.splice(itemIndex, 1)[0];
    await writeItemsData(data);

    // Invalidate cache
    await invalidateCache("items::*");

    logger.info("Item deleted successfully", {
      correlationId: req.correlationId,
      itemId,
      itemName: deletedItem.name,
    });

    res.json({
      message: `Item with ID ${itemId} deleted successfully`,
      deletedItem,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
