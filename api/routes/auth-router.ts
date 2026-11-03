import { Router } from "express";
import { authController } from "../controller/auth-controller";
import { requireInternalUser } from "../middlewares/auth-middleware";

const authRouter = Router();

authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);
authRouter.get("/me", requireInternalUser, authController.me);

export { authRouter };
