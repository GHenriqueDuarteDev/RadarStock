import { Router } from "express";
import { alertsController } from "../controller/alerts-controller";
import { requireInternalUser } from "../middlewares/auth-middleware";

const alertsRouter = Router();

alertsRouter.get("/", requireInternalUser, alertsController.listAlerts);
alertsRouter.get("/badge", requireInternalUser, alertsController.getBadge);
alertsRouter.post(
  "/mark-read",
  requireInternalUser,
  alertsController.markRead,
);

export { alertsRouter };
