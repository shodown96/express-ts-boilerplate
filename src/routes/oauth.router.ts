import { Router } from "express";
import { OauthController } from "../controllers";

const router = Router();

router.post("/google-sign-in", OauthController.googleSignIn);

export { router as oauthRouter };
