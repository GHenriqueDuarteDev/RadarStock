"use client";

import { useState } from "react";
import type { ReportExportFormat, ReportId } from "@radarstock/contracts";
import { DownloadIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

type ReportExportButtonsProps = {
  reportId: ReportId;
  query: string;
};

async function readErrorMessage(response: Response) {
  try {
    const data = (await response.json()) as { message?: string };
    return data.message ?? "Não foi possível exportar o relatório.";
  } catch {
    return "Não foi possível exportar o relatório.";
  }
}

export function ReportExportButtons({
  reportId,
  query,
}: ReportExportButtonsProps) {
  const [exporting, setExporting] = useState<ReportExportFormat | null>(null);

  async function handleExport(format: ReportExportFormat) {
    setExporting(format);
    try {
      const params = new URLSearchParams(query);
      params.set("format", format);
      const response = await fetch(
        `/api/reports/${reportId}/export?${params.toString()}`,
      );
      if (!response.ok) {
        throw new Error(await readErrorMessage(response));
      }
      const blob = await response.blob();
      const disposition = response.headers.get("content-disposition");
      const match = disposition?.match(/filename="?([^"]+)"?/);
      const filename = match?.[1] ?? `radarstock-${reportId}.${format}`;
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.add({
        type: "error",
        title:
          error instanceof Error
            ? error.message
            : "Não foi possível exportar o relatório.",
      });
    } finally {
      setExporting(null);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant="outline"
        disabled={exporting !== null}
        onClick={() => void handleExport("csv")}
      >
        <DownloadIcon data-icon="inline-start" />
        CSV
      </Button>
      <Button
        type="button"
        variant="outline"
        disabled={exporting !== null}
        onClick={() => void handleExport("xlsx")}
      >
        <DownloadIcon data-icon="inline-start" />
        XLSX
      </Button>
      <Button
        type="button"
        variant="outline"
        disabled={exporting !== null}
        onClick={() => void handleExport("pdf")}
      >
        <DownloadIcon data-icon="inline-start" />
        PDF
      </Button>
    </div>
  );
}
