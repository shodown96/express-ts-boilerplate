import { Router } from "express";
import { AuthController } from "../controllers";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.post("/sign-up", AuthController.signUp);
router.post("/sign-in", AuthController.signIn);
router.post("/sign-out", authenticate, AuthController.signOut);
router.post("/set-password", authenticate, AuthController.setPassword);
router.post("/refresh-token", AuthController.getToken);
router.post("/send-code", AuthController.sendCode);
router.post("/verify-code", AuthController.verifyCode);
router.post("/check-email", AuthController.checkEmailExists);
router.post("/verify-email", authenticate, AuthController.verifyEmail);
router.post("/reset-password", AuthController.resetPassword);
router.post("/forgot-password", AuthController.forgotPassword);
router.post("/change-password", authenticate, AuthController.changePassword);

export { router as authRouter };
