import { Router } from "express";
import { stockMovementController } from "../controller/stock-movements-controller";
import {
  requireInternalUser,
  requirePermission,
} from "../middlewares/auth-middleware";

const stockMovementRouter = Router();

stockMovementRouter.get(
  "/",
  requireInternalUser,
  stockMovementController.listMovements,
);
stockMovementRouter.get(
  "/summary",
  requireInternalUser,
  stockMovementController.getSummary,
);
stockMovementRouter.get(
  "/:id",
  requireInternalUser,
  stockMovementController.getMovementById,
);
stockMovementRouter.post(
  "/",
  requireInternalUser,
  requirePermission("movements.write"),
  stockMovementController.createMovement,
);

export { stockMovementRouter };
