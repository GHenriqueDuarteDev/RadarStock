import { Router } from "express";
import { productController } from "../controller/products-controller";
import {
  requireInternalUser,
  requirePermission,
} from "../middlewares/auth-middleware";

const productRouter = Router();

productRouter.get("/", requireInternalUser, productController.listProducts);
productRouter.get(
  "/summary",
  requireInternalUser,
  productController.getSummary,
);
productRouter.get(
  "/:id",
  requireInternalUser,
  productController.getProductById,
);
productRouter.post(
  "/",
  requireInternalUser,
  requirePermission("products.write"),
  productController.createProduct,
);
productRouter.patch(
  "/:id",
  requireInternalUser,
  requirePermission("products.write"),
  productController.updateProductById,
);
productRouter.delete(
  "/:id",
  requireInternalUser,
  requirePermission("products.write"),
  productController.deleteProductById,
);

export { productRouter };
