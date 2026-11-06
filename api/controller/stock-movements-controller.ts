import {
  listStockMovementsQuerySchema,
  stockMovementInputSchema,
} from "@radarstock/contracts";
import { stockMovementService } from "../services";
import type { Request, Response } from "express";

async function listMovements(req: Request, res: Response) {
  const parsed = listStockMovementsQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    res.status(400).json({ message: "Parâmetros de listagem inválidos." });
    return;
  }

  const { page, name } = parsed.data;
  const { status, data } = await stockMovementService.listMovements(page, name);
  res.status(status).json(data);
}

async function getSummary(_req: Request, res: Response) {
  const { status, data } = await stockMovementService.getSummary();
  res.status(status).json(data);
}

async function getMovementById(req: Request, res: Response) {
  const id = req.params.id;

  if (!id || typeof id !== "string") {
    res.status(400).json({ message: "Id da movimentação inválido." });
    return;
  }

  const { status, data } = await stockMovementService.getMovementById(id);
  res.status(status).json(data);
}

async function createMovement(req: Request, res: Response) {
  const parsed = stockMovementInputSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ message: "Dados de movimentação inválidos." });
    return;
  }

  const userId = res.locals.userId as string | undefined;
  if (!userId) {
    res.status(401).json({ message: "Usuário não autenticado." });
    return;
  }

  const { status, data } = await stockMovementService.createMovement(
    parsed.data,
    userId,
  );
  res.status(status).json(data);
}

export const stockMovementController = {
  listMovements,
  getSummary,
  getMovementById,
  createMovement,
};
