import swaggerUi from "swagger-ui-express";

const specs = {
  openapi: "3.0.0",
  info: {
    title: "Edu Bridge API",
    version: "1.0.0",
    description: "A simple API for Edu Bridge backend",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Development server",
    },
  ],
  paths: {
    "/api/hello": {
      get: {
        summary: "Get a hello message",
        description: "Returns a simple hello message from the API",
        tags: ["Hello"],
        responses: {
          "200": {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Hello from Edu Bridge API! 👋",
                    },
                    timestamp: {
                      type: "string",
                      format: "date-time",
                      example: "2024-01-01T00:00:00.000Z",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/users": {
      get: {
        summary: "Get all users",
        description: "Returns a list of all users in the system",
        tags: ["Users"],
        responses: {
          "200": {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    users: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "number", example: 1 },
                          name: { type: "string", example: "John Doe" },
                          email: {
                            type: "string",
                            example: "john@example.com",
                          },
                          role: { type: "string", example: "student" },
                        },
                      },
                    },
                    count: { type: "number", example: 3 },
                    timestamp: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/users/{id}": {
      get: {
        summary: "Get user by ID",
        description: "Returns a specific user by their ID",
        tags: ["Users"],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "integer" },
            description: "User ID",
          },
        ],
        responses: {
          "200": {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    user: {
                      type: "object",
                      properties: {
                        id: { type: "number" },
                        name: { type: "string" },
                        email: { type: "string" },
                        role: { type: "string" },
                      },
                    },
                    timestamp: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
          "404": {
            description: "User not found",
          },
        },
      },
    },
  },
};

export { specs, swaggerUi };
