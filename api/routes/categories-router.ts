import { Router } from "express";
import { categoryController } from "../controller/categories-controller";
import {
  requireInternalUser,
  requirePermission,
} from "../middlewares/auth-middleware";

const categoryRouter = Router();

categoryRouter.get("/", requireInternalUser, categoryController.getAllCategories);
categoryRouter.get(
  "/:id",
  requireInternalUser,
  categoryController.getCategoryById,
);
categoryRouter.post(
  "/",
  requireInternalUser,
  requirePermission("categories.write"),
  categoryController.createCategory,
);
categoryRouter.patch(
  "/:id",
  requireInternalUser,
  requirePermission("categories.write"),
  categoryController.updateCategoryById,
);
categoryRouter.delete(
  "/:id",
  requireInternalUser,
  requirePermission("categories.write"),
  categoryController.deleteCategoryById,
);

export { categoryRouter };
