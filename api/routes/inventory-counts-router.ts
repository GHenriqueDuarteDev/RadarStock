import { Router } from "express";
import { inventoryCountController } from "../controller/inventory-counts-controller";
import { requireInternalUser } from "../middlewares/auth-middleware";

const inventoryCountsRouter = Router();

inventoryCountsRouter.get(
  "/",
  requireInternalUser,
  inventoryCountController.listInventoryCounts,
);
inventoryCountsRouter.get(
  "/summary",
  requireInternalUser,
  inventoryCountController.getSummary,
);
inventoryCountsRouter.get(
  "/:id",
  requireInternalUser,
  inventoryCountController.getInventoryCountById,
);
inventoryCountsRouter.post(
  "/",
  requireInternalUser,
  inventoryCountController.createInventoryCount,
);
inventoryCountsRouter.patch(
  "/:id",
  requireInternalUser,
  inventoryCountController.updateInventoryCount,
);
inventoryCountsRouter.post(
  "/:id/confirm",
  requireInternalUser,
  inventoryCountController.confirmInventoryCount,
);
inventoryCountsRouter.post(
  "/:id/cancel",
  requireInternalUser,
  inventoryCountController.cancelInventoryCount,
);

export { inventoryCountsRouter };
