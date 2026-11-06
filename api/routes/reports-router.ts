import { Router } from "express";

import { reportsController } from "../controller/reports-controller";
import {
  requireInternalUser,
  requirePermission,
} from "../middlewares/auth-middleware";

const reportsRouter = Router();

reportsRouter.get("/", requireInternalUser, reportsController.getCatalog);
reportsRouter.get(
  "/:reportId/export",
  requireInternalUser,
  requirePermission("reports.export"),
  reportsController.exportReport,
);
reportsRouter.get(
  "/:reportId",
  requireInternalUser,
  reportsController.getPreview,
);

export { reportsRouter };
