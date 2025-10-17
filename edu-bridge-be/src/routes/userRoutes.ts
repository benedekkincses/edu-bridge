import { Router } from "express";
import { getCurrentUser } from "../controllers/userController.js";
import { verifyToken } from "../middleware/keycloakAuth.js";

const router = Router();

// Apply authentication middleware to all user routes
router.use(verifyToken);

// Get current authenticated user info from Keycloak token
router.get("/users/me", getCurrentUser);

export default router;
