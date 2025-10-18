import { Router } from "express";
import { listSchools } from "../controllers/schoolController.js";
import { verifyToken } from "../middleware/keycloakAuth.js";

const router = Router();

// Apply token verification middleware to all school routes
router.use(verifyToken);

// School routes
router.get("/schools", listSchools);

export default router;
