import { Request, Response } from "express";
import { getUserInfo } from "../middleware/keycloakAuth.js";

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
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
 *                     id:
 *                       type: string
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
 *       403:
 *         description: Forbidden
 */
export const getProfile = (req: Request, res: Response) => {
  try {
    const user = getUserInfo(req);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
    }

    const profile = {
      id: user.sub,
      username: user.preferred_username,
      email: user.email,
      firstName: user.given_name,
      lastName: user.family_name,
      roles: user.realm_access?.roles || [],
      emailVerified: user.email_verified,
      name: user.name,
    };

    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error("Error getting user profile:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

/**
 * @swagger
 * /api/auth/verify:
 *   get:
 *     summary: Verify if token is valid
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *       401:
 *         description: Invalid token
 */
export const verifyToken = (req: Request, res: Response) => {
  try {
    const user = getUserInfo(req);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid token",
      });
    }

    res.json({
      success: true,
      message: "Token is valid",
      user: {
        id: user.sub,
        username: user.preferred_username,
        email: user.email,
        roles: user.realm_access?.roles || [],
      },
    });
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user (client-side token removal)
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
export const logout = (req: Request, res: Response) => {
  // In JWT-based authentication, logout is typically handled client-side
  // by removing the token from storage. This endpoint provides confirmation.
  res.json({
    success: true,
    message: "Logout successful. Please remove the token from client storage.",
  });
};
