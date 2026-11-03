import { Router } from "express";
import { userController } from "../controller/users-controller";
import {
  requireInternalUser,
  requireRoles,
} from "../middlewares/auth-middleware";

const userRouter = Router();

userRouter.get("/", requireInternalUser, userController.getAllUsers);
userRouter.get("/:id", requireInternalUser, userController.getUserById);
userRouter.patch(
  "/:id/role",
  requireInternalUser,
  requireRoles("admin"),
  userController.updateUserRole,
);
userRouter.patch("/:id", requireInternalUser, userController.updateUserById);
userRouter.delete("/:id", requireInternalUser, userController.deleteUserById);

export { userRouter };
