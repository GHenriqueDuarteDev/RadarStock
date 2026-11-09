import { Router } from "express";
import { receiptController } from "../controller/receipts-controller";
import {
  requireInternalUser,
  requirePermission,
} from "../middlewares/auth-middleware";

const receiptsRouter = Router();

receiptsRouter.get("/", requireInternalUser, receiptController.listReceipts);
receiptsRouter.get(
  "/summary",
  requireInternalUser,
  receiptController.getSummary,
);
receiptsRouter.get(
  "/:id",
  requireInternalUser,
  receiptController.getReceiptById,
);
receiptsRouter.post(
  "/",
  requireInternalUser,
  requirePermission("receipts.write"),
  receiptController.createReceipt,
);
receiptsRouter.post(
  "/:id/cancel",
  requireInternalUser,
  requirePermission("receipts.write"),
  receiptController.cancelReceipt,
);

export { receiptsRouter };
