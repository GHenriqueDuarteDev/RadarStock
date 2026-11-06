import { Router } from "express";
import { dashboardController } from "../controller/dashboard-controller";
import { requireInternalUser } from "../middlewares/auth-middleware";

const dashboardRouter = Router();

dashboardRouter.get(
  "/metrics",
  requireInternalUser,
  dashboardController.getMetrics,
);
dashboardRouter.get(
  "/movements-series",
  requireInternalUser,
  dashboardController.getMovementsSeries,
);
dashboardRouter.get(
  "/warehouse-distribution",
  requireInternalUser,
  dashboardController.getWarehouseDistribution,
);
dashboardRouter.get(
  "/recent-movements",
  requireInternalUser,
  dashboardController.getRecentMovements,
);
dashboardRouter.get(
  "/alerts",
  requireInternalUser,
  dashboardController.getAlerts,
);

export { dashboardRouter };
