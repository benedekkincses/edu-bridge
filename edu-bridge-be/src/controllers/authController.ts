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
 *                       description: User ID from Keycloak
 *                     username:
 *                       type: string
 *                       description: Preferred username
 *                     email:
 *                       type: string
 *                       description: User email address
 *                     firstName:
 *                       type: string
 *                       description: User's first name
 *                     lastName:
 *                       type: string
 *                       description: User's last name
 *                     phoneNumber:
 *                       type: string
 *                       description: User's phone number
 *                     roles:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: User roles
 *                     emailVerified:
 *                       type: boolean
 *                       description: Whether email is verified
 *                     name:
 *                       type: string
 *                       description: Full name
 *                     issuedAt:
 *                       type: string
 *                       format: date-time
 *                       description: Token issued timestamp
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *                       description: Token expiration timestamp
 *                     issuer:
 *                       type: string
 *                       description: JWT issuer
 *                     audience:
 *                       type: string
 *                       description: JWT audience
 *                     clientId:
 *                       type: string
 *                       description: Client ID that issued the token
 *                     sessionId:
 *                       type: string
 *                       description: Keycloak session ID
 *                     authTime:
 *                       type: string
 *                       format: date-time
 *                       description: Authentication timestamp
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
      phoneNumber: user.phone_number,
      roles: user.realm_access?.roles || [],
      emailVerified: user.email_verified,
      name: user.name,
      // Additional JWT token information
      issuedAt: new Date(user.iat * 1000).toISOString(),
      expiresAt: new Date(user.exp * 1000).toISOString(),
      issuer: user.iss,
      audience: user.aud,
      clientId: user.azp,
      sessionId: user.sid,
      authTime: new Date(user.auth_time * 1000).toISOString(),
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
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: User ID from Keycloak
 *                     username:
 *                       type: string
 *                       description: Preferred username
 *                     email:
 *                       type: string
 *                       description: User email address
 *                     firstName:
 *                       type: string
 *                       description: User's first name
 *                     lastName:
 *                       type: string
 *                       description: User's last name
 *                     phoneNumber:
 *                       type: string
 *                       description: User's phone number
 *                     roles:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: User roles
 *                     emailVerified:
 *                       type: boolean
 *                       description: Whether email is verified
 *                     name:
 *                       type: string
 *                       description: Full name
 *                     issuedAt:
 *                       type: string
 *                       format: date-time
 *                       description: Token issued timestamp
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *                       description: Token expiration timestamp
 *                     issuer:
 *                       type: string
 *                       description: JWT issuer
 *                     audience:
 *                       type: string
 *                       description: JWT audience
 *                     clientId:
 *                       type: string
 *                       description: Client ID that issued the token
 *                     sessionId:
 *                       type: string
 *                       description: Keycloak session ID
 *                     authTime:
 *                       type: string
 *                       format: date-time
 *                       description: Authentication timestamp
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
        firstName: user.given_name,
        lastName: user.family_name,
        phoneNumber: user.phone_number,
        roles: user.realm_access?.roles || [],
        emailVerified: user.email_verified,
        name: user.name,
        // Additional JWT token information
        issuedAt: new Date(user.iat * 1000).toISOString(),
        expiresAt: new Date(user.exp * 1000).toISOString(),
        issuer: user.iss,
        audience: user.aud,
        clientId: user.azp,
        sessionId: user.sid,
        authTime: new Date(user.auth_time * 1000).toISOString(),
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
