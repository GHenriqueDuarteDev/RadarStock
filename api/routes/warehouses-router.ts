import { Router } from "express";
import { warehouseController } from "../controller/warehouses-controller";
import {
  requireInternalUser,
  requirePermission,
} from "../middlewares/auth-middleware";

const warehouseRouter = Router();

warehouseRouter.get(
  "/",
  requireInternalUser,
  warehouseController.listWarehouses,
);
warehouseRouter.get(
  "/summary",
  requireInternalUser,
  warehouseController.getSummary,
);
warehouseRouter.get(
  "/:id/balances",
  requireInternalUser,
  warehouseController.listBalances,
);
warehouseRouter.get(
  "/:id",
  requireInternalUser,
  warehouseController.getWarehouseById,
);
warehouseRouter.post(
  "/",
  requireInternalUser,
  requirePermission("warehouses.write"),
  warehouseController.createWarehouse,
);
warehouseRouter.patch(
  "/:id",
  requireInternalUser,
  requirePermission("warehouses.write"),
  warehouseController.updateWarehouseById,
);
warehouseRouter.delete(
  "/:id",
  requireInternalUser,
  requirePermission("warehouses.write"),
  warehouseController.deleteWarehouseById,
);

export { warehouseRouter };
