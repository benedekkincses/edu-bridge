import { Request, Response } from "express";
import { getUserInfo } from "../middleware/keycloakAuth.js";
import { messageService } from "../services/messageService.js";

/**
 * @swagger
 * /api/schools/{schoolId}/users:
 *   get:
 *     summary: Get all users in a school (for finding people to chat with)
 *     tags: [Messages]
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
 *         description: List of users retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export const getSchoolUsers = async (req: Request, res: Response) => {
  try {
    const user = getUserInfo(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
    }

    const { schoolId } = req.params;
    const userId = user.sub;

    const users = await messageService.getSchoolUsers(schoolId, userId);

    res.json({
      success: true,
      data: {
        users,
        count: users.length,
      },
    });
  } catch (error) {
    console.error("Error getting school users:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve users",
    });
  }
};

/**
 * @swagger
 * /api/threads:
 *   get:
 *     summary: Get all threads for the current user
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of threads retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export const getUserThreads = async (req: Request, res: Response) => {
  try {
    const user = getUserInfo(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
    }

    const userId = user.sub;
    const threads = await messageService.getUserThreads(userId);

    res.json({
      success: true,
      data: {
        threads,
        count: threads.length,
      },
    });
  } catch (error) {
    console.error("Error getting user threads:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve threads",
    });
  }
};

/**
 * @swagger
 * /api/threads:
 *   post:
 *     summary: Create or get a direct thread with another user
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               otherUserId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Thread created or retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export const createOrGetThread = async (req: Request, res: Response) => {
  try {
    const user = getUserInfo(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
    }

    const userId = user.sub;
    const { otherUserId } = req.body;

    if (!otherUserId) {
      return res.status(400).json({
        success: false,
        error: "otherUserId is required",
      });
    }

    const thread = await messageService.createOrGetDirectThread(userId, otherUserId);

    res.json({
      success: true,
      data: { thread },
    });
  } catch (error) {
    console.error("Error creating/getting thread:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create or get thread",
    });
  }
};

/**
 * @swagger
 * /api/threads/{threadId}/messages:
 *   get:
 *     summary: Get messages for a specific thread
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: threadId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Messages retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: User does not have access to this thread
 *       500:
 *         description: Internal server error
 */
export const getThreadMessages = async (req: Request, res: Response) => {
  try {
    const user = getUserInfo(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
    }

    const userId = user.sub;
    const { threadId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const messages = await messageService.getThreadMessages(threadId, userId, limit, offset);

    res.json({
      success: true,
      data: {
        messages,
        count: messages.length,
      },
    });
  } catch (error: any) {
    console.error("Error getting thread messages:", error);

    if (error.message === "User does not have access to this thread") {
      return res.status(403).json({
        success: false,
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to retrieve messages",
    });
  }
};

/**
 * @swagger
 * /api/threads/{threadId}/messages:
 *   post:
 *     summary: Send a message in a thread
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: threadId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message sent successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: User does not have access to this thread
 *       500:
 *         description: Internal server error
 */
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const user = getUserInfo(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
    }

    const userId = user.sub;
    const { threadId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: "content is required",
      });
    }

    const message = await messageService.sendMessage(threadId, userId, content);

    res.json({
      success: true,
      data: { message },
    });
  } catch (error: any) {
    console.error("Error sending message:", error);

    if (error.message === "User does not have access to this thread") {
      return res.status(403).json({
        success: false,
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to send message",
    });
  }
};

/**
 * @swagger
 * /api/messages/{messageId}/read:
 *   post:
 *     summary: Mark a message as read
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Message marked as read successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export const markMessageAsRead = async (req: Request, res: Response) => {
  try {
    const user = getUserInfo(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
    }

    const userId = user.sub;
    const { messageId } = req.params;

    const readStatus = await messageService.markMessageAsRead(messageId, userId);

    res.json({
      success: true,
      data: { readStatus },
    });
  } catch (error) {
    console.error("Error marking message as read:", error);
    res.status(500).json({
      success: false,
      error: "Failed to mark message as read",
    });
  }
};
