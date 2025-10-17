import { Request, Response } from "express";
import { getUserInfo } from "../middleware/keycloakAuth.js";

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     description: Returns a list of all users in the system (requires authentication)
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
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: number
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "John Doe"
 *                       email:
 *                         type: string
 *                         example: "john@example.com"
 *                       role:
 *                         type: string
 *                         example: "student"
 *                 count:
 *                   type: number
 *                   example: 3
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 currentUser:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     username:
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
export const getUsers = (req: Request, res: Response) => {
  try {
    const currentUser = getUserInfo(req);

    if (!currentUser) {
      return res.status(401).json({
        error: "User not authenticated",
      });
    }

    // Mock user data
    const users = [
      {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        role: "student",
      },
      {
        id: 2,
        name: "Jane Smith",
        email: "jane@example.com",
        role: "teacher",
      },
      {
        id: 3,
        name: "Bob Johnson",
        email: "bob@example.com",
        role: "admin",
      },
    ];

    res.json({
      users,
      count: users.length,
      timestamp: new Date().toISOString(),
      currentUser: {
        id: currentUser.sub,
        username: currentUser.preferred_username,
        email: currentUser.email,
        roles: currentUser.realm_access?.roles || [],
      },
    });
  } catch (error) {
    console.error("Error getting users:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Returns a specific user by their ID (requires authentication)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: number
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
export const getUserById = (req: Request, res: Response) => {
  try {
    const currentUser = getUserInfo(req);

    if (!currentUser) {
      return res.status(401).json({
        error: "User not authenticated",
      });
    }

    const { id } = req.params;
    const userId = parseInt(id);

    // Mock user data
    const users = [
      {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        role: "student",
      },
      {
        id: 2,
        name: "Jane Smith",
        email: "jane@example.com",
        role: "teacher",
      },
      {
        id: 3,
        name: "Bob Johnson",
        email: "bob@example.com",
        role: "admin",
      },
    ];

    const user = users.find((u) => u.id === userId);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
        message: `No user found with ID ${userId}`,
      });
    }

    res.json({
      user,
      timestamp: new Date().toISOString(),
      requestedBy: {
        id: currentUser.sub,
        username: currentUser.preferred_username,
      },
    });
  } catch (error) {
    console.error("Error getting user by ID:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};
