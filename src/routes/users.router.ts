import { UsersController } from "@/controllers";
import { authenticate } from "@/middlewares/auth.middleware";
import { Router } from "express";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Authenticated user profile
 */

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Get the current user's profile
 *     description: Returns the authenticated user's account data. The role field is omitted and replaced with an isAdmin boolean.
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User profile returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 whatsappNumber:
 *                   type: string
 *                 isAdmin:
 *                   type: boolean
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *   patch:
 *     summary: Update the current user's profile
 *     description: Updates name and/or whatsappNumber for the authenticated account.
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               whatsappNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/profile", authenticate, UsersController.getMe);
router.patch("/profile", authenticate, UsersController.updateMe);

export { router as usersRouter };