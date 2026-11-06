import { Router } from "express";
import { warehouseController } from "../controller/warehouses-controller";
import { requireInternalUser } from "../middlewares/auth-middleware";

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
  warehouseController.createWarehouse,
);
warehouseRouter.patch(
  "/:id",
  requireInternalUser,
  warehouseController.updateWarehouseById,
);
warehouseRouter.delete(
  "/:id",
  requireInternalUser,
  warehouseController.deleteWarehouseById,
);

export { warehouseRouter };
