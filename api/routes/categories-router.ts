import { Router } from "express";
import { categoryController } from "../controller/categories-controller";
import { requireInternalUser } from "../middlewares/auth-middleware";

const categoryRouter = Router();

categoryRouter.get("/", requireInternalUser, categoryController.getAllCategories);
categoryRouter.get(
  "/:id",
  requireInternalUser,
  categoryController.getCategoryById,
);
categoryRouter.post("/", requireInternalUser, categoryController.createCategory);
categoryRouter.patch(
  "/:id",
  requireInternalUser,
  categoryController.updateCategoryById,
);
categoryRouter.delete(
  "/:id",
  requireInternalUser,
  categoryController.deleteCategoryById,
);

export { categoryRouter };
