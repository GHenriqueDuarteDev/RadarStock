import { Router } from "express";
import { authController } from "../controller/auth-controller";
import {
  requireInternalUser,
  requirePermission,
} from "../middlewares/auth-middleware";

const authRouter = Router();

authRouter.post(
  "/register",
  requireInternalUser,
  requirePermission("team.manage"),
  authController.adminRegister,
);
authRouter.post("/login", authController.login);
authRouter.get("/me", requireInternalUser, authController.me);

export { authRouter };
