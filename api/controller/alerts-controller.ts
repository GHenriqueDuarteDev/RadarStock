import {
  alertKindSchema,
  listAlertsQuerySchema,
  markAlertsReadSchema,
  updateAlertRuleSchema,
} from "@radarstock/contracts";
import type { Request, Response } from "express";
import { alertsService } from "../services";

async function listAlerts(req: Request, res: Response) {
  const parsed = listAlertsQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    res.status(400).json({ message: "Parâmetros de alertas inválidos." });
    return;
  }

  const { status, data } = await alertsService.listOpen(parsed.data);
  res.status(status).json(data);
}

async function getBadge(_req: Request, res: Response) {
  const { status, data } = await alertsService.getBadgeCounts();
  res.status(status).json(data);
}

async function markRead(req: Request, res: Response) {
  const parsed = markAlertsReadSchema.safeParse(req.body ?? {});

  if (!parsed.success) {
    res.status(400).json({ message: "Dados de leitura inválidos." });
    return;
  }

  const { status, data } = await alertsService.markAllRead(parsed.data.ids);
  res.status(status).json(data);
}

async function listRules(_req: Request, res: Response) {
  const { status, data } = await alertsService.listRules();
  res.status(status).json(data);
}

async function updateRule(req: Request, res: Response) {
  const kindParsed = alertKindSchema.safeParse(req.params.kind);

  if (!kindParsed.success) {
    res.status(400).json({ message: "Tipo de gatilho inválido." });
    return;
  }

  const parsed = updateAlertRuleSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ message: "Dados de gatilho inválidos." });
    return;
  }

  const { status, data } = await alertsService.updateRule(
    kindParsed.data,
    parsed.data,
  );
  res.status(status).json(data);
}

export const alertsController = {
  listAlerts,
  getBadge,
  markRead,
  listRules,
  updateRule,
};
