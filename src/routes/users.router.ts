import { UsersController } from "@/controllers/users.controller";
import { authenticate } from "@/middlewares/auth.middleware";
import { Router } from "express";

const router = Router();

router.get("/profile", authenticate, UsersController.myProfileController);

export { router as usersRouter };
