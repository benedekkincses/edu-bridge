import { Request, Response } from "express";

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     description: Returns a list of all users in the system
 *     tags: [Users]
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
 */
export const getUsers = (req: Request, res: Response) => {
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
  });
};

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Returns a specific user by their ID
 *     tags: [Users]
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
 *       404:
 *         description: User not found
 */
export const getUserById = (req: Request, res: Response) => {
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
  });
};
