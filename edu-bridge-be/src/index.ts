import express from "express";
import cors from "cors";
import { specs, swaggerUi } from "./config/swagger.js";
import helloRoutes from "./routes/helloRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import schoolRoutes from "./routes/schoolRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

const app = express();
const port = process.env.PORT || 3000;

// CORS middleware - Allow all origins for development
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
app.use("/api/auth", authRoutes);
app.use("/api", schoolRoutes);
app.use("/api", messageRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Edu Bridge API",
    documentation: "Visit /api-docs for Swagger documentation",
    authentication: "This API uses Keycloak for authentication",
    endpoints: {
      hello: "GET /api/hello",
      users: "GET /api/users (requires authentication)",
      userById: "GET /api/users/:id (requires authentication)",
      schools: "GET /api/schools (requires authentication)",
      auth: {
        profile: "GET /api/auth/profile (requires authentication)",
        verify: "GET /api/auth/verify (requires authentication)",
        logout: "POST /api/auth/logout",
      },
    },
    keycloak: {
      url: "http://10.1.3.50:8080",
      realm: "myrealm",
      clientId: "edu-bridge-backend",
    },
  });
});

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(
    `📚 API Documentation available at http://localhost:${port}/api-docs`
  );
});
