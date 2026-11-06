import { Router } from "express";
import { receiptController } from "../controller/receipts-controller";
import { requireInternalUser } from "../middlewares/auth-middleware";

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
receiptsRouter.post("/", requireInternalUser, receiptController.createReceipt);
receiptsRouter.post(
  "/:id/cancel",
  requireInternalUser,
  receiptController.cancelReceipt,
);

export { receiptsRouter };
