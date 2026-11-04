import { Router } from "express";
import { authController } from "../controller/auth-controller";
import {
  requireInternalUser,
  requireRoles,
} from "../middlewares/auth-middleware";

const authRouter = Router();

authRouter.post(
  "/register",
  requireInternalUser,
  requireRoles("admin"),
  authController.adminRegister,
);
authRouter.post("/login", authController.login);
authRouter.get("/me", requireInternalUser, authController.me);

export { authRouter };
