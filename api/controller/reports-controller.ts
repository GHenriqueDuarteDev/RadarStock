import {
  reportExportFormatSchema,
  reportIdSchema,
} from "@radarstock/contracts";
import type { Request, Response } from "express";

import {
  getExportContentType,
  getExportFilename,
  renderReportExport,
} from "../services/reports-export";
import { reportsService } from "../services/reports-service";

function queryBag(query: Request["query"]) {
  const bag: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(query)) {
    if (typeof value === "string") {
      bag[key] = value;
    } else if (Array.isArray(value) && typeof value[0] === "string") {
      bag[key] = value[0];
    }
  }
  return bag;
}

async function getCatalog(_req: Request, res: Response) {
  const { status, data } = await reportsService.getCatalog();
  res.status(status).json(data);
}

async function getPreview(req: Request, res: Response) {
  const parsedId = reportIdSchema.safeParse(req.params.reportId);
  if (!parsedId.success) {
    res.status(404).json({ message: "Relatório não encontrado." });
    return;
  }

  const { status, data } = await reportsService.getPreview(
    parsedId.data,
    queryBag(req.query),
  );
  res.status(status).json(data);
}

async function exportReport(req: Request, res: Response) {
  const parsedId = reportIdSchema.safeParse(req.params.reportId);
  if (!parsedId.success) {
    res.status(404).json({ message: "Relatório não encontrado." });
    return;
  }

  const bag = queryBag(req.query);
  const parsedFormat = reportExportFormatSchema.safeParse(bag.format);
  if (!parsedFormat.success) {
    res.status(400).json({
      message: "Informe format=csv, xlsx ou pdf.",
    });
    return;
  }

  const result = await reportsService.getExportPayload(parsedId.data, bag);
  if (result.status !== 200) {
    res.status(result.status).json(result.data);
    return;
  }

  const buffer = await renderReportExport(result.data, parsedFormat.data);
  const filename = getExportFilename(parsedId.data, parsedFormat.data);

  res.setHeader("Content-Type", getExportContentType(parsedFormat.data));
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${filename}"`,
  );
  res.status(200).send(buffer);
}

export const reportsController = {
  getCatalog,
  getPreview,
  exportReport,
};
