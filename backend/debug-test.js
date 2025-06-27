const request = require("supertest");
const app = require("./src/index");

async function debugErrorResponse() {
  console.log("Testing error response format...");

  try {
    // Test invalid ID format
    const response = await request(app).get("/api/items/invalid").expect(400);

    console.log("Status:", response.status);
    console.log("Headers:", response.headers);
    console.log("Body:", JSON.stringify(response.body, null, 2));
    console.log("Body type:", typeof response.body);
    console.log("Has error property:", response.body.hasOwnProperty("error"));
    console.log("Error object:", response.body.error);
  } catch (error) {
    console.error("Test failed:", error.message);
    if (error.response) {
      console.log("Response status:", error.response.status);
      console.log(
        "Response body:",
        JSON.stringify(error.response.body, null, 2)
      );
    }
  }
}

debugErrorResponse();
