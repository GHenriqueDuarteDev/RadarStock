import { Router } from "express";
import { productController } from "../controller/products-controller";
import { requireInternalUser } from "../middlewares/auth-middleware";

const productRouter = Router();

productRouter.get("/", requireInternalUser, productController.getAllProducts);
productRouter.get(
  "/:id",
  requireInternalUser,
  productController.getProductById,
);
productRouter.post("/", requireInternalUser, productController.createProduct);
productRouter.patch(
  "/:id",
  requireInternalUser,
  productController.updateProductById,
);
productRouter.delete(
  "/:id",
  requireInternalUser,
  productController.deleteProductById,
);

export { productRouter };
