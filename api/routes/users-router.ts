import { Router } from "express";
import { userController } from "../controller/users-controller";
import {
  requireInternalUser,
  requireRoles,
} from "../middlewares/auth-middleware";

const userRouter = Router();

userRouter.post("/", userController.registerUser);
userRouter.get(
  "/",
  requireInternalUser,
  requireRoles("admin"),
  userController.getAllUsers,
);
userRouter.get(
  "/:id",
  requireInternalUser,
  requireRoles("admin"),
  userController.getUserById,
);
userRouter.patch(
  "/:id/role",
  requireInternalUser,
  requireRoles("admin"),
  userController.updateUserRole,
);
userRouter.patch("/:id", requireInternalUser, userController.updateUserById);
userRouter.delete(
  "/:id",
  requireInternalUser,
  requireRoles("admin"),
  userController.deleteUserById,
);

export { userRouter };
