import express from "express";
import { specs, swaggerUi } from "./config/swagger.ts";
import helloRoutes from "./routes/helloRoutes.ts";

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Swagger documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.use("/api", helloRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Edu Bridge API",
    documentation: "Visit /api-docs for Swagger documentation",
    endpoints: {
      hello: "GET /api/hello",
    },
  });
});

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(
    `📚 API Documentation available at http://localhost:${port}/api-docs`
  );
});
