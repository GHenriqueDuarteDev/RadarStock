import {
  listSalesQuerySchema,
  saleInputSchema,
} from "@radarstock/contracts";
import { saleService } from "../services";
import type { Request, Response } from "express";

async function listSales(req: Request, res: Response) {
  const parsed = listSalesQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    res.status(400).json({ message: "Parâmetros de listagem inválidos." });
    return;
  }

  const { page, code } = parsed.data;
  const { status, data } = await saleService.listSales(page, code);
  res.status(status).json(data);
}

async function getSummary(_req: Request, res: Response) {
  const { status, data } = await saleService.getSummary();
  res.status(status).json(data);
}

async function getSaleById(req: Request, res: Response) {
  const id = req.params.id;

  if (!id || typeof id !== "string") {
    res.status(400).json({ message: "Id da venda inválido." });
    return;
  }

  const { status, data } = await saleService.getSaleById(id);
  res.status(status).json(data);
}

async function createSale(req: Request, res: Response) {
  const parsed = saleInputSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ message: "Dados de venda inválidos." });
    return;
  }

  const userId = res.locals.userId as string | undefined;
  if (!userId) {
    res.status(401).json({ message: "Usuário não autenticado." });
    return;
  }

  const { status, data } = await saleService.createSale(parsed.data, userId);
  res.status(status).json(data);
}

async function cancelSale(req: Request, res: Response) {
  const id = req.params.id;

  if (!id || typeof id !== "string") {
    res.status(400).json({ message: "Id da venda inválido." });
    return;
  }

  const userId = res.locals.userId as string | undefined;
  if (!userId) {
    res.status(401).json({ message: "Usuário não autenticado." });
    return;
  }

  const { status, data } = await saleService.cancelSale(id, userId);
  res.status(status).json(data);
}

export const saleController = {
  listSales,
  getSummary,
  getSaleById,
  createSale,
  cancelSale,
};
