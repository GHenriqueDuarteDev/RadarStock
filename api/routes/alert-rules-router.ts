import { Router } from "express";
import { alertsController } from "../controller/alerts-controller";
import {
  requireInternalUser,
  requirePermission,
} from "../middlewares/auth-middleware";

const alertRulesRouter = Router();

alertRulesRouter.get(
  "/",
  requireInternalUser,
  requirePermission("settings.read"),
  alertsController.listRules,
);
alertRulesRouter.patch(
  "/:kind",
  requireInternalUser,
  requirePermission("alertRules.write"),
  alertsController.updateRule,
);

export { alertRulesRouter };
