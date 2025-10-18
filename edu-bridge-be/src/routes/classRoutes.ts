import { Router } from "express";
import { getUserClasses, getClassGroups, createGroup } from "../controllers/classController.js";

const router = Router();

// Class routes
router.get("/classes", getUserClasses);

// Group (channel) routes
router.get("/classes/:classId/groups", getClassGroups);
router.post("/classes/:classId/groups", createGroup);

export default router;
