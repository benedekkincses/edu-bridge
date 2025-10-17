import { Request, Response } from "express";
import { getUserInfo } from "../middleware/keycloakAuth.js";

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get current user info from Keycloak token
 *     description: Returns the authenticated user's information extracted from JWT token
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: Keycloak user ID
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     roles:
 *                       type: array
 *                       items:
 *                         type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export const getCurrentUser = (req: Request, res: Response) => {
  try {
    const currentUser = getUserInfo(req);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
    }

    res.json({
      success: true,
      user: {
        id: currentUser.sub,
        username: currentUser.preferred_username,
        email: currentUser.email,
        firstName: currentUser.given_name,
        lastName: currentUser.family_name,
        roles: currentUser.realm_access?.roles || [],
        emailVerified: currentUser.email_verified,
      },
    });
  } catch (error) {
    console.error("Error getting current user:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
