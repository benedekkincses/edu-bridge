import { Request, Response } from "express";
import { getUserInfo } from "../middleware/keycloakAuth.js";
import { classService } from "../services/classService.js";

/**
 * @swagger
 * /api/classes:
 *   get:
 *     summary: Get all classes the current user has access to
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of classes retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export const getUserClasses = async (req: Request, res: Response) => {
  try {
    const user = getUserInfo(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
    }

    const userId = user.sub;
    const classes = await classService.getUserClasses(userId);

    res.json({
      success: true,
      data: {
        classes,
        count: classes.length,
      },
    });
  } catch (error: any) {
    console.error("Error getting user classes:", error);

    res.status(500).json({
      success: false,
      error: "Failed to retrieve classes",
    });
  }
};

/**
 * @swagger
 * /api/classes/{classId}/groups:
 *   get:
 *     summary: Get all groups (channels) in a class
 *     tags: [Classes]
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
 *         description: List of groups retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: User does not have access to this class
 *       500:
 *         description: Internal server error
 */
export const getClassGroups = async (req: Request, res: Response) => {
  try {
    const user = getUserInfo(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
    }

    const userId = user.sub;
    const { classId } = req.params;

    const groups = await classService.getClassGroups(classId, userId);

    res.json({
      success: true,
      data: {
        groups,
        count: groups.length,
      },
    });
  } catch (error: any) {
    console.error("Error getting class groups:", error);

    if (error.message === "User does not have access to this class") {
      return res.status(403).json({
        success: false,
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to retrieve groups",
    });
  }
};

/**
 * @swagger
 * /api/classes/{classId}/groups:
 *   post:
 *     summary: Create a new group (channel) in a class
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Group created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: User does not have permission to create groups
 *       500:
 *         description: Internal server error
 */
export const createGroup = async (req: Request, res: Response) => {
  try {
    const user = getUserInfo(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
    }

    const userId = user.sub;
    const { classId } = req.params;
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: "Group name is required",
      });
    }

    const group = await classService.createGroup(
      classId,
      userId,
      name.trim(),
      description?.trim()
    );

    res.json({
      success: true,
      data: { group },
    });
  } catch (error: any) {
    console.error("Error creating group:", error);

    if (
      error.message === "User does not have access to this class" ||
      error.message === "User does not have permission to create groups"
    ) {
      return res.status(403).json({
        success: false,
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to create group",
    });
  }
};
