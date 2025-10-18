import { Router } from "express";
import { getUserClasses, getClassGroups, createGroup, getClassMembers, addUserToGroup } from "../controllers/classController.js";

const router = Router();

// Class routes
router.get("/classes", getUserClasses);
router.get("/classes/:classId/members", getClassMembers);

// Group (channel) routes
router.get("/classes/:classId/groups", getClassGroups);
router.post("/classes/:classId/groups", createGroup);
router.post("/groups/:groupId/members", addUserToGroup);

export default router;
