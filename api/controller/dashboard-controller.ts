import { dashboardMovementsQuerySchema } from "@radarstock/contracts";
import type { Request, Response } from "express";
import { dashboardService } from "../services";

async function getMetrics(_req: Request, res: Response) {
  const { status, data } = await dashboardService.getMetrics();
  res.status(status).json(data);
}

async function getMovementsSeries(req: Request, res: Response) {
  const parsed = dashboardMovementsQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    res.status(400).json({ message: "Parâmetros de série inválidos." });
    return;
  }

  const { status, data } = await dashboardService.getMovementsSeries(
    parsed.data.days,
  );
  res.status(status).json(data);
}

async function getWarehouseDistribution(_req: Request, res: Response) {
  const { status, data } = await dashboardService.getWarehouseDistribution();
  res.status(status).json(data);
}

async function getRecentMovements(_req: Request, res: Response) {
  const { status, data } = await dashboardService.getRecentMovements();
  res.status(status).json(data);
}

export const dashboardController = {
  getMetrics,
  getMovementsSeries,
  getWarehouseDistribution,
  getRecentMovements,
};
