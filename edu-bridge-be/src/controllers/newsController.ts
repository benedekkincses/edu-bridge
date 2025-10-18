import { Request, Response } from "express";
import { getUserInfo } from "../middleware/keycloakAuth.js";
import { newsService } from "../services/newsService.js";
import { NewsPostType } from "@prisma/client";

/**
 * @swagger
 * /api/news/school/{schoolId}:
 *   get:
 *     summary: Get news posts for a school
 *     tags: [News]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: schoolId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: News posts retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export const getSchoolNews = async (req: Request, res: Response) => {
  try {
    const user = getUserInfo(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
    }

    const { schoolId } = req.params;
    const newsPosts = await newsService.getSchoolNews(schoolId, user.sub);

    res.json({
      success: true,
      data: newsPosts,
    });
  } catch (error) {
    console.error("Error fetching school news:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve news posts",
    });
  }
};

/**
 * @swagger
 * /api/news/class/{classId}:
 *   get:
 *     summary: Get news posts for a class
 *     tags: [News]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: News posts retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export const getClassNews = async (req: Request, res: Response) => {
  try {
    const user = getUserInfo(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
    }

    const { classId } = req.params;
    const newsPosts = await newsService.getClassNews(classId, user.sub);

    res.json({
      success: true,
      data: newsPosts,
    });
  } catch (error) {
    console.error("Error fetching class news:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve news posts",
    });
  }
};

/**
 * @swagger
 * /api/news:
 *   post:
 *     summary: Create a news post (announcement or poll)
 *     tags: [News]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - scope
 *               - type
 *               - title
 *               - content
 *             properties:
 *               scope:
 *                 type: string
 *                 enum: [school, class]
 *               schoolId:
 *                 type: string
 *               classId:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [announcement, poll]
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               pollOptions:
 *                 type: array
 *                 items:
 *                   type: string
 *               attachments:
 *                 type: array
 *     responses:
 *       201:
 *         description: News post created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - user does not have permission to post news
 *       500:
 *         description: Internal server error
 */
export const createNewsPost = async (req: Request, res: Response) => {
  try {
    const user = getUserInfo(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
    }

    const { scope, schoolId, classId, type, title, content, pollOptions, attachments } = req.body;

    // Validate required fields
    if (!scope || !type || !title || !content) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: scope, type, title, content",
      });
    }

    // Check permissions
    let hasPermission = false;
    if (scope === "school" && schoolId) {
      hasPermission = await newsService.canPostToSchool(user.sub, schoolId);
    } else if (scope === "class" && classId) {
      hasPermission = await newsService.canPostToClass(user.sub, classId);
    } else {
      return res.status(400).json({
        success: false,
        error: "Invalid scope or missing scope ID",
      });
    }

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        error: "You do not have permission to post news in this scope",
      });
    }

    const newsPost = await newsService.createNewsPost(
      user.sub,
      scope,
      schoolId,
      classId,
      type as NewsPostType,
      title,
      content,
      pollOptions,
      attachments
    );

    res.status(201).json({
      success: true,
      data: newsPost,
    });
  } catch (error: any) {
    console.error("Error creating news post:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to create news post",
    });
  }
};

/**
 * @swagger
 * /api/news/{newsPostId}/like:
 *   post:
 *     summary: Toggle like on a news post
 *     tags: [News]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: newsPostId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Like toggled successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: News post not found
 *       500:
 *         description: Internal server error
 */
export const toggleLike = async (req: Request, res: Response) => {
  try {
    const user = getUserInfo(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
    }

    const { newsPostId } = req.params;
    const result = await newsService.toggleLike(newsPostId, user.sub);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("Error toggling like:", error);
    if (error.message === "News post not found") {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }
    res.status(500).json({
      success: false,
      error: "Failed to toggle like",
    });
  }
};

/**
 * @swagger
 * /api/news/poll/{pollOptionId}/vote:
 *   post:
 *     summary: Vote on a poll option
 *     tags: [News]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pollOptionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vote recorded successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Poll option not found
 *       500:
 *         description: Internal server error
 */
export const voteOnPoll = async (req: Request, res: Response) => {
  try {
    const user = getUserInfo(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
    }

    const { pollOptionId } = req.params;
    const result = await newsService.voteOnPoll(pollOptionId, user.sub);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("Error voting on poll:", error);
    if (error.message === "Poll option not found" || error.message === "This news post is not a poll") {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }
    res.status(500).json({
      success: false,
      error: "Failed to record vote",
    });
  }
};

/**
 * @swagger
 * /api/news/{newsPostId}:
 *   delete:
 *     summary: Delete a news post
 *     tags: [News]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: newsPostId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: News post deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - user can only delete their own posts
 *       404:
 *         description: News post not found
 *       500:
 *         description: Internal server error
 */
export const deleteNewsPost = async (req: Request, res: Response) => {
  try {
    const user = getUserInfo(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
    }

    const { newsPostId } = req.params;
    const result = await newsService.deleteNewsPost(newsPostId, user.sub);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("Error deleting news post:", error);
    if (error.message === "News post not found") {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }
    if (error.message === "You can only delete your own news posts") {
      return res.status(403).json({
        success: false,
        error: error.message,
      });
    }
    res.status(500).json({
      success: false,
      error: "Failed to delete news post",
    });
  }
};

/**
 * @swagger
 * /api/news/permissions/school/{schoolId}:
 *   get:
 *     summary: Check if user can post news to a school
 *     tags: [News]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: schoolId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Permission check result
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export const checkSchoolPostPermission = async (req: Request, res: Response) => {
  try {
    const user = getUserInfo(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
    }

    const { schoolId } = req.params;
    const canPost = await newsService.canPostToSchool(user.sub, schoolId);

    res.json({
      success: true,
      data: { canPost },
    });
  } catch (error) {
    console.error("Error checking school post permission:", error);
    res.status(500).json({
      success: false,
      error: "Failed to check permission",
    });
  }
};

/**
 * @swagger
 * /api/news/permissions/class/{classId}:
 *   get:
 *     summary: Check if user can post news to a class
 *     tags: [News]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Permission check result
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export const checkClassPostPermission = async (req: Request, res: Response) => {
  try {
    const user = getUserInfo(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
    }

    const { classId } = req.params;
    const canPost = await newsService.canPostToClass(user.sub, classId);

    res.json({
      success: true,
      data: { canPost },
    });
  } catch (error) {
    console.error("Error checking class post permission:", error);
    res.status(500).json({
      success: false,
      error: "Failed to check permission",
    });
  }
};
