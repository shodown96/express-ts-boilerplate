import { Router } from "express";
import { AuthController } from "@/controllers";
import { authenticate } from "@/middlewares/auth.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and account management
 */

/**
 * @swagger
 * /auth/sign-up:
 *   post:
 *     summary: Register a new account
 *     description: Creates a new account and sends a welcome email. Returns access and refresh tokens.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, whatsappNumber]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               whatsappNumber:
 *                 type: string
 *     responses:
 *       201:
 *         description: Account created successfully. Returns user object, accessToken and refreshToken.
 *       400:
 *         description: Missing fields or email already registered
 *       500:
 *         description: Internal server error
 */
router.post("/sign-up", AuthController.signUp);

/**
 * @swagger
 * /auth/sign-in:
 *   post:
 *     summary: Sign in to an existing account
 *     description: Authenticates with email and password. Returns access and refresh tokens.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Signed in successfully. Returns user object, accessToken and refreshToken.
 *       400:
 *         description: Missing email or password
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Internal server error
 */
router.post("/sign-in", AuthController.signIn);

/**
 * @swagger
 * /auth/sign-out:
 *   post:
 *     summary: Sign out the current user
 *     description: Clears the auth cookie.
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Signed out successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/sign-out", authenticate, AuthController.signOut);

/**
 * @swagger
 * /auth/set-password:
 *   post:
 *     summary: Set a password for the authenticated account
 *     description: Used when an account was created without a password (e.g. via OTP flow) and needs one set.
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password set successfully
 *       400:
 *         description: Missing password or bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/set-password", authenticate, AuthController.setPassword);

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Refresh the access token
 *     description: Accepts a valid refresh token and returns a new access token.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Returns a new accessToken
 *       401:
 *         description: Invalid or missing refresh token
 *       500:
 *         description: Internal server error
 */
router.post("/refresh-token", AuthController.getToken);

/**
 * @swagger
 * /auth/send-code:
 *   post:
 *     summary: Send a verification OTP to an email address
 *     description: Generates a 6-digit OTP and emails it to the provided address. Creates or updates the verification token record.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Missing email
 *       500:
 *         description: Internal server error
 */
router.post("/send-code", AuthController.sendCode);

/**
 * @swagger
 * /auth/verify-code:
 *   post:
 *     summary: Verify an OTP code
 *     description: Checks the code against the stored verification token without consuming it. Used to validate the code before proceeding to reset password.
 *     tags: [Auth]
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
 *                 example: "482910"
 *     responses:
 *       200:
 *         description: OTP is valid
 *       400:
 *         description: Missing code
 *       401:
 *         description: Invalid or expired OTP
 *       500:
 *         description: Internal server error
 */
router.post("/verify-code", AuthController.verifyCode);

/**
 * @swagger
 * /auth/check-email:
 *   post:
 *     summary: Check if an email is already registered
 *     description: Returns 400 if the email exists, 200 if it is available.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Email is available
 *       400:
 *         description: Email already registered or missing
 *       500:
 *         description: Internal server error
 */
router.post("/check-email", AuthController.checkEmailExists);

/**
 * @swagger
 * /auth/verify-email:
 *   post:
 *     summary: Verify the authenticated user's email with an OTP
 *     description: Consumes the OTP for the authenticated user's email and marks it as verified.
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
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
 *                 example: "482910"
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Missing code
 *       401:
 *         description: Invalid OTP or unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/verify-email", authenticate, AuthController.verifyEmail);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request a password reset OTP
 *     description: Sends a password reset OTP to the provided email if an account exists.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Reset OTP sent if account exists
 *       400:
 *         description: Missing email or account not found
 *       500:
 *         description: Internal server error
 */
router.post("/forgot-password", AuthController.forgotPassword);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password using an OTP
 *     description: Validates the OTP and sets a new password. Rejects if the new password is the same as the current one.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, code, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               code:
 *                 type: string
 *                 example: "482910"
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Missing fields, invalid OTP, or same password used
 *       401:
 *         description: Invalid OTP
 *       500:
 *         description: Internal server error
 */
router.post("/reset-password", AuthController.resetPassword);

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     summary: Change password for the authenticated user
 *     description: Requires the current password. Rejects if the new password is the same as the current one.
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password, newPassword]
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Current password
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 description: New password
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Missing fields or same password used
 *       401:
 *         description: Current password incorrect or unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/change-password", authenticate, AuthController.changePassword);

export { router as authRouter };