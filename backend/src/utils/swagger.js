// backend/src/utils/swagger.js
// OpenAPI/Swagger configuration for API documentation

const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Items API",
      version: "2.0.0",
      description:
        "A comprehensive REST API for managing items with caching, rate limiting, and security features.",
      contact: {
        name: "API Support",
        email: "support@itemsapi.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: "http://localhost:3001",
        description: "Development server",
      },
      {
        url: "https://api.items.com",
        description: "Production server",
      },
    ],
    components: {
      schemas: {
        Item: {
          type: "object",
          required: ["id", "name"],
          properties: {
            id: {
              type: "integer",
              description: "Unique identifier for the item",
              example: 1,
            },
            name: {
              type: "string",
              description: "Name of the item",
              example: "Laptop",
            },
            category: {
              type: "string",
              description: "Category of the item",
              example: "Electronics",
            },
            price: {
              type: "number",
              description: "Price of the item",
              example: 999.99,
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Creation timestamp",
              example: "2025-06-27T16:00:00.000Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Last update timestamp",
              example: "2025-06-27T16:30:00.000Z",
            },
          },
        },
        ItemList: {
          type: "object",
          properties: {
            items: {
              type: "array",
              items: {
                $ref: "#/components/schemas/Item",
              },
            },
            total: {
              type: "integer",
              description: "Total number of items",
              example: 3,
            },
            timestamp: {
              type: "string",
              format: "date-time",
              description: "Response timestamp",
              example: "2025-06-27T16:00:00.000Z",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: {
              type: "object",
              properties: {
                code: {
                  type: "string",
                  description: "Error code for programmatic handling",
                  example: "ITEM_NOT_FOUND",
                },
                message: {
                  type: "string",
                  description: "Human-readable error message",
                  example: "Item with ID 999 not found",
                },
              },
            },
            timestamp: {
              type: "string",
              format: "date-time",
              description: "Error timestamp",
              example: "2025-06-27T16:00:00.000Z",
            },
            path: {
              type: "string",
              description: "Request path",
              example: "/api/items/999",
            },
            correlationId: {
              type: "string",
              description: "Request correlation ID for tracing",
              example: "550e8400-e29b-41d4-a716-446655440000",
            },
          },
        },
        CreateItemRequest: {
          type: "object",
          required: ["name"],
          properties: {
            name: {
              type: "string",
              description: "Name of the item (required)",
              example: "New Laptop",
            },
            category: {
              type: "string",
              description: "Category of the item",
              example: "Electronics",
            },
            price: {
              type: "number",
              description: "Price of the item",
              example: 1299.99,
            },
          },
        },
        UpdateItemRequest: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "New name for the item",
              example: "Updated Laptop",
            },
            category: {
              type: "string",
              description: "New category for the item",
              example: "Electronics",
            },
            price: {
              type: "number",
              description: "New price for the item",
              example: 1199.99,
            },
          },
        },
      },
      responses: {
        BadRequest: {
          description: "Bad Request - Invalid input data",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
              example: {
                error: {
                  code: "INVALID_ID",
                  message: "Invalid item ID",
                },
                timestamp: "2025-06-27T16:00:00.000Z",
                path: "/api/items/invalid",
                correlationId: "550e8400-e29b-41d4-a716-446655440000",
              },
            },
          },
        },
        NotFound: {
          description: "Not Found - Resource not found",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
              example: {
                error: {
                  code: "ITEM_NOT_FOUND",
                  message: "Item with ID 999 not found",
                },
                timestamp: "2025-06-27T16:00:00.000Z",
                path: "/api/items/999",
                correlationId: "550e8400-e29b-41d4-a716-446655440000",
              },
            },
          },
        },
        InternalServerError: {
          description: "Internal Server Error",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
              example: {
                error: {
                  code: "INTERNAL_SERVER_ERROR",
                  message: "Internal Server Error",
                },
                timestamp: "2025-06-27T16:00:00.000Z",
                path: "/api/items",
                correlationId: "550e8400-e29b-41d4-a716-446655440000",
              },
            },
          },
        },
        RateLimitExceeded: {
          description: "Too Many Requests - Rate limit exceeded",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
              example: {
                error: {
                  code: "RATE_LIMIT_EXCEEDED",
                  message: "Too many requests, please try again later.",
                },
              },
            },
          },
        },
      },
      parameters: {
        ItemId: {
          name: "id",
          in: "path",
          required: true,
          description: "Unique identifier of the item",
          schema: {
            type: "integer",
            minimum: 1,
          },
          example: 1,
        },
        SearchQuery: {
          name: "q",
          in: "query",
          description: "Search term to filter items by name or category",
          schema: {
            type: "string",
          },
          example: "laptop",
        },
        Limit: {
          name: "limit",
          in: "query",
          description: "Maximum number of items to return",
          schema: {
            type: "integer",
            minimum: 1,
            maximum: 100,
          },
          example: 10,
        },
      },
    },
    tags: [
      {
        name: "Items",
        description: "Operations for managing items",
      },
      {
        name: "Health",
        description: "Health check and monitoring endpoints",
      },
    ],
  },
  apis: ["./src/routes/*.js", "./src/index.js"], // Path to the API docs
};

const specs = swaggerJsdoc(options);

module.exports = specs;
