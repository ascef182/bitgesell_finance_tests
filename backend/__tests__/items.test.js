const request = require("supertest");
const path = require("path");

// Import the complete app with middleware
const app = require("../src/index");

// Test data
const testItems = [
  { id: 1, name: "Test Laptop", category: "Electronics", price: 1000 },
  { id: 2, name: "Test Headphones", category: "Electronics", price: 200 },
  { id: 3, name: "Test Book", category: "Books", price: 50 },
];

// Mock the file utilities
jest.mock("../src/utils/fileUtils");

const {
  readJsonFile,
  writeJsonFile,
  fileExists,
} = require("../src/utils/fileUtils");

const { clearCache } = require("../src/utils/cache");

describe("Items API Routes", () => {
  beforeEach(async () => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Clear cache before each test
    await clearCache();

    // Default mock implementations
    fileExists.mockResolvedValue(true);
    readJsonFile.mockResolvedValue([...testItems]);
    writeJsonFile.mockResolvedValue();
  });

  describe("GET /api/items", () => {
    it("should return all items with metadata", async () => {
      const response = await request(app).get("/api/items").expect(200);

      expect(response.body.items).toEqual(testItems);
      expect(response.body.total).toBe(3);
      expect(response.body.filtered).toBe(3);
      expect(response.body.hasMore).toBe(false);
    });

    it("should filter items by search query", async () => {
      const response = await request(app)
        .get("/api/items?q=laptop")
        .expect(200);

      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0].name).toBe("Test Laptop");
      expect(response.body.filtered).toBe(1);
    });

    it("should limit results when limit parameter is provided", async () => {
      const response = await request(app).get("/api/items?limit=2").expect(200);

      expect(response.body.items).toHaveLength(2);
      expect(response.body.hasMore).toBe(true);
    });

    it("should return 400 for invalid limit parameter", async () => {
      const response = await request(app)
        .get("/api/items?limit=invalid")
        .expect(400);

      expect(response.body.error.code).toBe("INVALID_LIMIT");
    });

    it("should handle file not found error", async () => {
      fileExists.mockResolvedValue(false);

      const response = await request(app).get("/api/items").expect(404);

      expect(response.body.error.code).toBe("DATA_READ_ERROR");
    });

    it("should handle file read errors", async () => {
      readJsonFile.mockRejectedValue(new Error("File read failed"));

      const response = await request(app).get("/api/items").expect(500);

      expect(response.body.error.code).toBe("DATA_READ_ERROR");
    });
  });

  describe("GET /api/items/:id", () => {
    it("should return a specific item by ID", async () => {
      const response = await request(app).get("/api/items/1").expect(200);

      expect(response.body).toEqual(testItems[0]);
    });

    it("should return 404 for non-existent item", async () => {
      const response = await request(app).get("/api/items/999").expect(404);

      expect(response.body.error.code).toBe("ITEM_NOT_FOUND");
    });

    it("should return 400 for invalid ID format", async () => {
      const response = await request(app).get("/api/items/invalid").expect(400);

      expect(response.body.error.code).toBe("INVALID_ID");
    });

    it("should return 400 for negative ID", async () => {
      const response = await request(app).get("/api/items/-1").expect(400);

      expect(response.body.error.code).toBe("INVALID_ID");
    });
  });

  describe("POST /api/items", () => {
    it("should create a new item", async () => {
      const newItem = {
        name: "New Item",
        category: "Test",
        price: 100,
      };

      const response = await request(app)
        .post("/api/items")
        .send(newItem)
        .expect(201);

      expect(response.body.name).toBe("New Item");
      expect(response.body.id).toBeDefined();
      expect(writeJsonFile).toHaveBeenCalled();
    });

    it("should return 400 for missing item data", async () => {
      const response = await request(app)
        .post("/api/items")
        .send({})
        .expect(400);

      expect(response.body.error.code).toBe("INVALID_ITEM_DATA");
    });

    it("should return 400 for missing name", async () => {
      const response = await request(app)
        .post("/api/items")
        .send({ category: "Test" })
        .expect(400);

      expect(response.body.error.code).toBe("MISSING_NAME");
    });

    it("should return 400 for empty name", async () => {
      const response = await request(app)
        .post("/api/items")
        .send({ name: "" })
        .expect(400);

      expect(response.body.error.code).toBe("MISSING_NAME");
    });

    it("should handle file write errors", async () => {
      writeJsonFile.mockRejectedValue(new Error("Write failed"));

      const response = await request(app)
        .post("/api/items")
        .send({ name: "Test Item" })
        .expect(500);

      expect(response.body.error.code).toBe("DATA_WRITE_ERROR");
    });
  });

  describe("PUT /api/items/:id", () => {
    it("should update an existing item", async () => {
      const updateData = {
        name: "Updated Laptop",
        price: 1200,
      };

      const response = await request(app)
        .put("/api/items/1")
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe("Updated Laptop");
      expect(response.body.price).toBe(1200);
      expect(writeJsonFile).toHaveBeenCalled();
    });

    it("should return 404 for non-existent item", async () => {
      const response = await request(app)
        .put("/api/items/999")
        .send({ name: "Test" })
        .expect(404);

      expect(response.body.error.code).toBe("ITEM_NOT_FOUND");
    });

    it("should return 400 for invalid ID", async () => {
      const response = await request(app)
        .put("/api/items/invalid")
        .send({ name: "Test" })
        .expect(400);

      expect(response.body.error.code).toBe("INVALID_ID");
    });

    it("should return 400 for invalid update data", async () => {
      const response = await request(app)
        .put("/api/items/1")
        .send(null)
        .expect(400);

      expect(response.body.error.code).toBe("INVALID_UPDATE_DATA");
    });
  });

  describe("DELETE /api/items/:id", () => {
    it("should delete an existing item", async () => {
      const response = await request(app).delete("/api/items/1").expect(200);

      expect(response.body.message).toBe("Item deleted successfully");
      expect(response.body.deletedItem).toEqual(testItems[0]);

      // Verify writeJsonFile was called with updated data (without deleted item)
      expect(writeJsonFile).toHaveBeenCalledWith(
        expect.any(String),
        testItems.filter((item) => item.id !== 1),
        expect.any(Object)
      );
    });

    it("should return 404 for non-existent item", async () => {
      const response = await request(app).delete("/api/items/999").expect(404);

      expect(response.body.error.code).toBe("ITEM_NOT_FOUND");
    });

    it("should return 400 for invalid ID", async () => {
      const response = await request(app)
        .delete("/api/items/invalid")
        .expect(400);

      expect(response.body.error.code).toBe("INVALID_ID");
    });
  });

  describe("Async Operation Performance", () => {
    it("should handle concurrent requests without blocking", async () => {
      // Simulate concurrent requests
      const promises = Array(5)
        .fill()
        .map(() => request(app).get("/api/items"));

      const responses = await Promise.all(promises);

      responses.forEach((response) => {
        expect(response.status).toBe(200);
        expect(response.body.items).toEqual(testItems);
      });
    });

    it("should handle async errors gracefully", async () => {
      // Mock a temporary error
      readJsonFile.mockRejectedValue(new Error("Temporary error"));

      const response = await request(app).get("/api/items").expect(500);

      expect(response.body.error.code).toBe("DATA_READ_ERROR");
      expect(response.body.error.message).toContain(
        "Failed to read items data"
      );
    });
  });
});
