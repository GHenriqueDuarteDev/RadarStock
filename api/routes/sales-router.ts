import { Router } from "express";
import { saleController } from "../controller/sales-controller";
import {
  requireInternalUser,
  requirePermission,
} from "../middlewares/auth-middleware";

const salesRouter = Router();

salesRouter.get("/", requireInternalUser, saleController.listSales);
salesRouter.get("/summary", requireInternalUser, saleController.getSummary);
salesRouter.get("/:id", requireInternalUser, saleController.getSaleById);
salesRouter.post(
  "/",
  requireInternalUser,
  requirePermission("sales.write"),
  saleController.createSale,
);
salesRouter.post(
  "/:id/cancel",
  requireInternalUser,
  requirePermission("sales.write"),
  saleController.cancelSale,
);

export { salesRouter };
