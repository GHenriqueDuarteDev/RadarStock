import {
  inventoryCountInputSchema,
  listInventoryCountsQuerySchema,
  updateInventoryCountInputSchema,
} from "@radarstock/contracts";
import { inventoryCountService } from "../services";
import type { Request, Response } from "express";

async function listInventoryCounts(req: Request, res: Response) {
  const parsed = listInventoryCountsQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    res.status(400).json({ message: "Parâmetros de listagem inválidos." });
    return;
  }

  const { page, code } = parsed.data;
  const { status, data } = await inventoryCountService.listInventoryCounts(
    page,
    code,
  );
  res.status(status).json(data);
}

async function getSummary(_req: Request, res: Response) {
  const { status, data } = await inventoryCountService.getSummary();
  res.status(status).json(data);
}

async function getInventoryCountById(req: Request, res: Response) {
  const id = req.params.id;

  if (!id || typeof id !== "string") {
    res.status(400).json({ message: "Id do inventário inválido." });
    return;
  }

  const { status, data } =
    await inventoryCountService.getInventoryCountById(id);
  res.status(status).json(data);
}

async function createInventoryCount(req: Request, res: Response) {
  const parsed = inventoryCountInputSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ message: "Dados de inventário inválidos." });
    return;
  }

  const userId = res.locals.userId as string | undefined;
  if (!userId) {
    res.status(401).json({ message: "Usuário não autenticado." });
    return;
  }

  const { status, data } = await inventoryCountService.createInventoryCount(
    parsed.data,
    userId,
  );
  res.status(status).json(data);
}

async function updateInventoryCount(req: Request, res: Response) {
  const id = req.params.id;

  if (!id || typeof id !== "string") {
    res.status(400).json({ message: "Id do inventário inválido." });
    return;
  }

  const parsed = updateInventoryCountInputSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ message: "Dados de inventário inválidos." });
    return;
  }

  const { status, data } = await inventoryCountService.updateInventoryCount(
    id,
    parsed.data,
  );
  res.status(status).json(data);
}

async function confirmInventoryCount(req: Request, res: Response) {
  const id = req.params.id;

  if (!id || typeof id !== "string") {
    res.status(400).json({ message: "Id do inventário inválido." });
    return;
  }

  const userId = res.locals.userId as string | undefined;
  if (!userId) {
    res.status(401).json({ message: "Usuário não autenticado." });
    return;
  }

  const { status, data } = await inventoryCountService.confirmInventoryCount(
    id,
    userId,
  );
  res.status(status).json(data);
}

async function cancelInventoryCount(req: Request, res: Response) {
  const id = req.params.id;

  if (!id || typeof id !== "string") {
    res.status(400).json({ message: "Id do inventário inválido." });
    return;
  }

  const userId = res.locals.userId as string | undefined;
  if (!userId) {
    res.status(401).json({ message: "Usuário não autenticado." });
    return;
  }

  const { status, data } = await inventoryCountService.cancelInventoryCount(
    id,
    userId,
  );
  res.status(status).json(data);
}

export const inventoryCountController = {
  listInventoryCounts,
  getSummary,
  getInventoryCountById,
  createInventoryCount,
  updateInventoryCount,
  confirmInventoryCount,
  cancelInventoryCount,
};
