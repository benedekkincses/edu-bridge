import express from "express";
import cors from "cors";
import { specs, swaggerUi } from "./config/swagger.ts";
import helloRoutes from "./routes/helloRoutes.ts";
import userRoutes from "./routes/userRoutes.ts";

const app = express();
const port = process.env.PORT || 3000;

// CORS middleware
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware
app.use(express.json());

// Swagger documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.use("/api", helloRoutes);
app.use("/api", userRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Edu Bridge API",
    documentation: "Visit /api-docs for Swagger documentation",
    endpoints: {
      hello: "GET /api/hello",
      users: "GET /api/users",
      userById: "GET /api/users/:id",
    },
  });
});

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(
    `📚 API Documentation available at http://localhost:${port}/api-docs`
  );
});
