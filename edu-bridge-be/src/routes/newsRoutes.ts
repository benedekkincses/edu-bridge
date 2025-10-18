import { Router } from "express";
import {
  getSchoolNews,
  getClassNews,
  createNewsPost,
  toggleLike,
  voteOnPoll,
  deleteNewsPost,
  checkSchoolPostPermission,
  checkClassPostPermission,
} from "../controllers/newsController.js";
import { verifyToken } from "../middleware/keycloakAuth.js";

const router = Router();

// Apply token verification middleware to all news routes
router.use(verifyToken);

// News routes
router.get("/news/school/:schoolId", getSchoolNews);
router.get("/news/class/:classId", getClassNews);
router.post("/news", createNewsPost);
router.post("/news/:newsPostId/like", toggleLike);
router.post("/news/poll/:pollOptionId/vote", voteOnPoll);
router.delete("/news/:newsPostId", deleteNewsPost);

// Permission check routes
router.get("/news/permissions/school/:schoolId", checkSchoolPostPermission);
router.get("/news/permissions/class/:classId", checkClassPostPermission);

export default router;
