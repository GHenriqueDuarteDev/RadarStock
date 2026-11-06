import { Router } from "express";
import { alertsController } from "../controller/alerts-controller";
import {
  requireInternalUser,
  requireRoles,
} from "../middlewares/auth-middleware";

const alertRulesRouter = Router();

alertRulesRouter.get("/", requireInternalUser, alertsController.listRules);
alertRulesRouter.patch(
  "/:kind",
  requireInternalUser,
  requireRoles("admin"),
  alertsController.updateRule,
);

export { alertRulesRouter };
