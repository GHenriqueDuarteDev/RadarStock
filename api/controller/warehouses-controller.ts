import {
  listWarehousesQuerySchema,
  updateWarehouseInputSchema,
  warehouseInputSchema,
} from "@radarstock/contracts";
import { warehouseService } from "../services";
import type { Request, Response } from "express";

async function listWarehouses(req: Request, res: Response) {
  const parsed = listWarehousesQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    res.status(400).json({ message: "Parâmetros de listagem inválidos." });
    return;
  }

  const { page, name } = parsed.data;
  const { status, data } = await warehouseService.listWarehouses(page, name);
  res.status(status).json(data);
}

async function getSummary(_req: Request, res: Response) {
  const { status, data } = await warehouseService.getSummary();
  res.status(status).json(data);
}

async function getWarehouseById(req: Request, res: Response) {
  const id = req.params.id;

  if (!id || typeof id !== "string") {
    res.status(400).json({ message: "Id do galpão inválido." });
    return;
  }

  const { status, data } = await warehouseService.getWarehouseById(id);
  res.status(status).json(data);
}

async function listBalances(req: Request, res: Response) {
  const id = req.params.id;

  if (!id || typeof id !== "string") {
    res.status(400).json({ message: "Id do galpão inválido." });
    return;
  }

  const { status, data } = await warehouseService.listBalances(id);
  res.status(status).json(data);
}

async function createWarehouse(req: Request, res: Response) {
  const parsed = warehouseInputSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ message: "Dados de galpão inválidos." });
    return;
  }

  const { status, data } = await warehouseService.createWarehouse(parsed.data);
  res.status(status).json(data);
}

async function updateWarehouseById(req: Request, res: Response) {
  const id = req.params.id;

  if (!id || typeof id !== "string") {
    res.status(400).json({ message: "Id do galpão inválido." });
    return;
  }

  const parsed = updateWarehouseInputSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ message: "Dados de atualização inválidos." });
    return;
  }

  if (Object.keys(parsed.data).length === 0) {
    res.status(400).json({ message: "Nenhum campo para atualizar." });
    return;
  }

  const { status, data } = await warehouseService.updateWarehouseById(
    id,
    parsed.data,
  );
  res.status(status).json(data);
}

async function deleteWarehouseById(req: Request, res: Response) {
  const id = req.params.id;

  if (!id || typeof id !== "string") {
    res.status(400).json({ message: "Id do galpão inválido." });
    return;
  }

  const { status, data } = await warehouseService.deleteWarehouseById(id);
  res.status(status).json(data);
}

export const warehouseController = {
  listWarehouses,
  getSummary,
  getWarehouseById,
  listBalances,
  createWarehouse,
  updateWarehouseById,
  deleteWarehouseById,
};
