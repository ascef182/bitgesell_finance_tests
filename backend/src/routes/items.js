const express = require("express");
const path = require("path");
const router = express.Router();

// Import async file utilities
const {
  readJsonFile,
  writeJsonFile,
  fileExists,
} = require("../utils/fileUtils");

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
    console.error("Error reading items data:", error.message);

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
    console.error("Error writing items data:", error.message);

    const enhancedError = new Error(
      `Failed to write items data: ${error.message}`
    );
    enhancedError.statusCode = 500;
    enhancedError.code = "DATA_WRITE_ERROR";

    throw enhancedError;
  }
}

/**
 * GET /api/items
 * Retrieve all items with optional filtering and pagination
 */
router.get("/", async (req, res, next) => {
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

    // Apply limit if specified
    if (limit) {
      const limitNum = parseInt(limit);
      if (isNaN(limitNum) || limitNum < 0) {
        const error = new Error("Invalid limit parameter");
        error.statusCode = 400;
        error.code = "INVALID_LIMIT";
        throw error;
      }
      results = results.slice(0, limitNum);
    }

    // Return results with metadata
    res.json({
      items: results,
      total: results.length,
      filtered: q ? results.length : data.length,
      hasMore: limit ? results.length < data.length : false,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/items/:id
 * Retrieve a specific item by ID
 */
router.get("/:id", async (req, res, next) => {
  try {
    // Validate ID parameter
    const id = parseInt(req.params.id);
    if (isNaN(id) || id < 0) {
      const error = new Error("Invalid item ID");
      error.statusCode = 400;
      error.code = "INVALID_ID";
      throw error;
    }

    // Read data asynchronously
    const data = await readItemsData();

    // Find item by ID
    const item = data.find((i) => i.id === id);

    if (!item) {
      const error = new Error(`Item with ID ${id} not found`);
      error.statusCode = 404;
      error.code = "ITEM_NOT_FOUND";
      throw error;
    }

    res.json(item);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/items
 * Create a new item
 */
router.post("/", async (req, res, next) => {
  try {
    // Enhanced validation for request body
    const item = req.body;

    // Check if body is null, undefined, or empty object
    if (!item || typeof item !== "object" || Object.keys(item).length === 0) {
      const error = new Error("Invalid item data");
      error.statusCode = 400;
      error.code = "INVALID_ITEM_DATA";
      throw error;
    }

    if (
      !item.name ||
      typeof item.name !== "string" ||
      item.name.trim() === ""
    ) {
      const error = new Error("Item name is required");
      error.statusCode = 400;
      error.code = "MISSING_NAME";
      throw error;
    }

    // Read existing data
    const data = await readItemsData();

    // Generate unique ID (using timestamp + random for uniqueness)
    const newId = Date.now() + Math.floor(Math.random() * 1000);

    // Create new item
    const newItem = {
      id: newId,
      name: item.name.trim(),
      category: item.category || "Uncategorized",
      price: item.price || 0,
    };

    // Add to data array
    data.push(newItem);

    // Write updated data back to file
    await writeItemsData(data);

    // Return created item with 201 status
    res.status(201).json(newItem);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/items/:id
 * Update an existing item
 */
router.put("/:id", async (req, res, next) => {
  try {
    // Validate ID parameter
    const id = parseInt(req.params.id);
    if (isNaN(id) || id < 0) {
      const error = new Error("Invalid item ID");
      error.statusCode = 400;
      error.code = "INVALID_ID";
      throw error;
    }

    // Enhanced validation for request body
    const updates = req.body;

    // Check if body is null, undefined, or empty object
    if (
      !updates ||
      typeof updates !== "object" ||
      Object.keys(updates).length === 0
    ) {
      const error = new Error("Invalid update data");
      error.statusCode = 400;
      error.code = "INVALID_UPDATE_DATA";
      throw error;
    }

    // Read existing data
    const data = await readItemsData();

    // Find item to update
    const itemIndex = data.findIndex((i) => i.id === id);

    if (itemIndex === -1) {
      const error = new Error(`Item with ID ${id} not found`);
      error.statusCode = 404;
      error.code = "ITEM_NOT_FOUND";
      throw error;
    }

    // Update item
    const updatedItem = {
      ...data[itemIndex],
      ...updates,
      id, // Ensure ID cannot be changed
    };

    data[itemIndex] = updatedItem;

    // Write updated data back to file
    await writeItemsData(data);

    res.json(updatedItem);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/items/:id
 * Delete an item
 */
router.delete("/:id", async (req, res, next) => {
  try {
    // Validate ID parameter
    const id = parseInt(req.params.id);
    if (isNaN(id) || id < 0) {
      const error = new Error("Invalid item ID");
      error.statusCode = 400;
      error.code = "INVALID_ID";
      throw error;
    }

    // Read existing data
    const data = await readItemsData();

    // Find item to delete
    const itemIndex = data.findIndex((i) => i.id === id);

    if (itemIndex === -1) {
      const error = new Error(`Item with ID ${id} not found`);
      error.statusCode = 404;
      error.code = "ITEM_NOT_FOUND";
      throw error;
    }

    // Remove item
    const deletedItem = data.splice(itemIndex, 1)[0];

    // Write updated data back to file
    await writeItemsData(data);

    res.json({ message: "Item deleted successfully", deletedItem });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
