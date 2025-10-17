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
  },
};

export { specs, swaggerUi };
