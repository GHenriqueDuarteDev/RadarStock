import { Router } from "express";

import { reportsController } from "../controller/reports-controller";
import { requireInternalUser } from "../middlewares/auth-middleware";

const reportsRouter = Router();

reportsRouter.get("/", requireInternalUser, reportsController.getCatalog);
reportsRouter.get(
  "/:reportId/export",
  requireInternalUser,
  reportsController.exportReport,
);
reportsRouter.get(
  "/:reportId",
  requireInternalUser,
  reportsController.getPreview,
);

export { reportsRouter };
