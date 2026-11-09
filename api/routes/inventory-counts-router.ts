import { Router } from "express";
import { inventoryCountController } from "../controller/inventory-counts-controller";
import {
  requireInternalUser,
  requirePermission,
} from "../middlewares/auth-middleware";

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
  requirePermission("inventory.write"),
  inventoryCountController.createInventoryCount,
);
inventoryCountsRouter.patch(
  "/:id",
  requireInternalUser,
  requirePermission("inventory.write"),
  inventoryCountController.updateInventoryCount,
);
inventoryCountsRouter.post(
  "/:id/confirm",
  requireInternalUser,
  requirePermission("inventory.write"),
  inventoryCountController.confirmInventoryCount,
);
inventoryCountsRouter.post(
  "/:id/cancel",
  requireInternalUser,
  requirePermission("inventory.write"),
  inventoryCountController.cancelInventoryCount,
);

export { inventoryCountsRouter };
