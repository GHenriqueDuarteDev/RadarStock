import { Router } from "express";
import { saleController } from "../controller/sales-controller";
import { requireInternalUser } from "../middlewares/auth-middleware";

const salesRouter = Router();

salesRouter.get("/", requireInternalUser, saleController.listSales);
salesRouter.get("/summary", requireInternalUser, saleController.getSummary);
salesRouter.get("/:id", requireInternalUser, saleController.getSaleById);
salesRouter.post("/", requireInternalUser, saleController.createSale);
salesRouter.post(
  "/:id/cancel",
  requireInternalUser,
  saleController.cancelSale,
);

export { salesRouter };
