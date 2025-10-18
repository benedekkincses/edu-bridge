import { Router } from "express";
import {
  getSchoolUsers,
  getUserThreads,
  createOrGetThread,
  getThreadMessages,
  sendMessage,
  markMessageAsRead,
} from "../controllers/messageController.js";
import { verifyToken } from "../middleware/keycloakAuth.js";

const router = Router();

// Apply token verification middleware to all message routes
router.use(verifyToken);

// Message routes
router.get("/schools/:schoolId/users", getSchoolUsers);
router.get("/threads", getUserThreads);
router.post("/threads", createOrGetThread);
router.get("/threads/:threadId/messages", getThreadMessages);
router.post("/threads/:threadId/messages", sendMessage);
router.post("/messages/:messageId/read", markMessageAsRead);

export default router;
