import { Router } from "express";
import {
  getProfile,
  verifyToken,
  logout,
} from "../controllers/authController.js";
import { verifyToken as verifyTokenMiddleware } from "../middleware/keycloakAuth.js";

const router = Router();

// Apply token verification middleware to all auth routes
router.use(verifyTokenMiddleware);

// Authentication routes
router.get("/profile", getProfile);
router.get("/verify", verifyToken);
router.post("/logout", logout);

export default router;
