import { Router } from "express";
import { getUsers, getUserById } from "../controllers/userController.js";
import { verifyToken } from "../middleware/keycloakAuth.js";

const router = Router();

// Apply authentication middleware to all user routes
router.use(verifyToken);

router.get("/users", getUsers);
router.get("/users/:id", getUserById);

export default router;
