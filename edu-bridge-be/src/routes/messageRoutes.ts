import { Router } from "express";
import {
  getSchoolUsers,
  getUserThreads,
  createOrGetThread,
  getThreadMessages,
  sendMessage,
  markMessageAsRead,
  createOrGetGroupThread,
  createOrGetClassThread,
  pollNewMessages,
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

// Group and class channel routes
router.post("/groups/:groupId/thread", createOrGetGroupThread);
router.post("/classes/:classId/thread", createOrGetClassThread);

// Long polling route
router.get("/threads/:threadId/poll", pollNewMessages);

export default router;
