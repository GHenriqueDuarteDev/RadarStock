import {
  listReceiptsQuerySchema,
  receiptInputSchema,
} from "@radarstock/contracts";
import { receiptService } from "../services";
import type { Request, Response } from "express";

async function listReceipts(req: Request, res: Response) {
  const parsed = listReceiptsQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    res.status(400).json({ message: "Parâmetros de listagem inválidos." });
    return;
  }

  const { page, code } = parsed.data;
  const { status, data } = await receiptService.listReceipts(page, code);
  res.status(status).json(data);
}

async function getSummary(_req: Request, res: Response) {
  const { status, data } = await receiptService.getSummary();
  res.status(status).json(data);
}

async function getReceiptById(req: Request, res: Response) {
  const id = req.params.id;

  if (!id || typeof id !== "string") {
    res.status(400).json({ message: "Id do recebimento inválido." });
    return;
  }

  const { status, data } = await receiptService.getReceiptById(id);
  res.status(status).json(data);
}

async function createReceipt(req: Request, res: Response) {
  const parsed = receiptInputSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ message: "Dados de recebimento inválidos." });
    return;
  }

  const userId = res.locals.userId as string | undefined;
  if (!userId) {
    res.status(401).json({ message: "Usuário não autenticado." });
    return;
  }

  const { status, data } = await receiptService.createReceipt(
    parsed.data,
    userId,
  );
  res.status(status).json(data);
}

async function cancelReceipt(req: Request, res: Response) {
  const id = req.params.id;

  if (!id || typeof id !== "string") {
    res.status(400).json({ message: "Id do recebimento inválido." });
    return;
  }

  const userId = res.locals.userId as string | undefined;
  if (!userId) {
    res.status(401).json({ message: "Usuário não autenticado." });
    return;
  }

  const { status, data } = await receiptService.cancelReceipt(id, userId);
  res.status(status).json(data);
}

export const receiptController = {
  listReceipts,
  getSummary,
  getReceiptById,
  createReceipt,
  cancelReceipt,
};
