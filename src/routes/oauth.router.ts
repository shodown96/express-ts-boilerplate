import { Router } from "express";
import { OauthController } from "@/controllers";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: OAuth
 *   description: Social authentication
 */

/**
 * @swagger
 * /oauth/google-sign-in:
 *   post:
 *     summary: Sign in or register with Google
 *     description: |
 *       Exchanges a Google authorization code for an access token, fetches the user's
 *       Google profile, then either creates a new account or updates the existing one.
 *       On success, sets an httpOnly auth cookie and returns the user object with
 *       access and refresh tokens.
 *
 *       If the account is new, a welcome email is sent automatically.
 *     tags: [OAuth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code]
 *             properties:
 *               code:
 *                 type: string
 *                 description: Google authorization code returned from the OAuth consent screen
 *     responses:
 *       200:
 *         description: |
 *           Signed in successfully. Sets httpOnly auth cookie.
 *           Returns user object (without role), accessToken, refreshToken, and isAdmin flag.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     avatarUrl:
 *                       type: string
 *                     isAdmin:
 *                       type: boolean
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       500:
 *         description: Internal server error or Google OAuth failure
 */
router.post("/google-sign-in", OauthController.googleSignIn);

export { router as oauthRouter };