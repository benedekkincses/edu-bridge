import { Request, Response } from "express";
import { getUserInfo } from "../middleware/keycloakAuth.js";
import { schoolService } from "../services/schoolService.js";

/**
 * @swagger
 * /api/schools:
 *   get:
 *     summary: Get list of schools the user has access to
 *     tags: [Schools]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of schools retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     schools:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           address:
 *                             type: string
 *                           logo:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                     count:
 *                       type: number
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export const listSchools = async (req: Request, res: Response) => {
  try {
    const user = getUserInfo(req);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
    }

    const userId = user.sub;
    const schools = await schoolService.getUserSchools(userId);

    res.json({
      success: true,
      data: {
        schools,
        count: schools.length,
      },
    });
  } catch (error) {
    console.error("Error listing schools:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve schools",
    });
  }
};
