import { Router } from "express";
import { userController } from "../controller/users-controller";
import {
  requireInternalUser,
  requirePermission,
} from "../middlewares/auth-middleware";

const userRouter = Router();

userRouter.post("/", userController.registerUser);
userRouter.get(
  "/",
  requireInternalUser,
  requirePermission("team.manage"),
  userController.listUsers,
);
userRouter.get(
  "/summary",
  requireInternalUser,
  requirePermission("team.manage"),
  userController.getSummary,
);
userRouter.get(
  "/:id",
  requireInternalUser,
  requirePermission("team.manage"),
  userController.getUserById,
);
userRouter.patch(
  "/:id/role",
  requireInternalUser,
  requirePermission("team.manage"),
  userController.updateUserRole,
);
userRouter.patch(
  "/:id",
  requireInternalUser,
  requirePermission("team.manage"),
  userController.updateUserById,
);
userRouter.delete(
  "/:id",
  requireInternalUser,
  requirePermission("team.manage"),
  userController.deleteUserById,
);

export { userRouter };
