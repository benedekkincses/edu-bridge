import { Request, Response } from "express";

/**
 * @swagger
 * /api/hello:
 *   get:
 *     summary: Get a hello message
 *     description: Returns a simple hello message from the API
 *     tags: [Hello]
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Hello from Edu Bridge API! 👋"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-01T00:00:00.000Z"
 */
export const getHello = (req: Request, res: Response) => {
  res.json({
    message: "Hello from Edu Bridge API! 👋",
    timestamp: new Date().toISOString(),
  });
};
