import { Router } from "express";
import { ContactController } from "@/controllers";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Contact
 *   description: Public contact form submissions
 */

/**
 * @swagger
 * /contact:
 *   post:
 *     summary: Submit a contact form message
 *     description: Emails the submission to the configured contact address, with the sender's email set as the reply-to.
 *     tags: [Contact]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, message]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Submission received successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Internal server error
 */
router.post("/", ContactController.submit);

export { router as contactRouter };
