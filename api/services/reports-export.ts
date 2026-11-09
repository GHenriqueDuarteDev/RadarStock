import type { ReportExportFormat } from "@radarstock/contracts";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";

import type { ReportExportPayload } from "./reports-service";

function escapeCsvCell(value: string | number | null) {
  if (value === null || value === undefined) {
    return "";
  }
  const text = String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function toCsv(payload: ReportExportPayload) {
  const lines = [
    payload.columns.map(escapeCsvCell).join(","),
    ...payload.rows.map((row) => row.map(escapeCsvCell).join(",")),
  ];
  return Buffer.from(`\uFEFF${lines.join("\n")}`, "utf8");
}

async function toXlsx(payload: ReportExportPayload) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "RadarStock";
  const sheet = workbook.addWorksheet(payload.title.slice(0, 31));
  sheet.addRow(payload.columns);
  for (const row of payload.rows) {
    sheet.addRow(row.map((cell) => (cell === null ? "" : cell)));
  }
  sheet.getRow(1).font = { bold: true };
  sheet.columns.forEach((column) => {
    column.width = 16;
  });
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

async function toPdf(payload: ReportExportPayload) {
  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({
      margin: 40,
      size: "A4",
      layout: "landscape",
    });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });
    doc.on("end", () => {
      resolve(Buffer.concat(chunks));
    });
    doc.on("error", reject);

    doc.fontSize(14).text(payload.title, { underline: true });
    doc.moveDown();
    doc.fontSize(8);

    const colCount = payload.columns.length;
    const usableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const colWidth = usableWidth / Math.max(colCount, 1);

    const drawRow = (cells: Array<string | number | null>, bold = false) => {
      const y = doc.y;
      if (y > doc.page.height - 50) {
        doc.addPage();
      }
      const rowY = doc.y;
      cells.forEach((cell, index) => {
        const text = cell === null || cell === undefined ? "" : String(cell);
        doc
          .font(bold ? "Helvetica-Bold" : "Helvetica")
          .text(text.slice(0, 40), doc.page.margins.left + index * colWidth, rowY, {
            width: colWidth - 4,
            lineBreak: false,
          });
      });
      doc.moveDown(0.8);
    };

    drawRow(payload.columns, true);
    for (const row of payload.rows) {
      drawRow(row);
    }

    doc.end();
  });
}

export function getExportContentType(format: ReportExportFormat) {
  switch (format) {
    case "csv":
      return "text/csv; charset=utf-8";
    case "xlsx":
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    case "pdf":
      return "application/pdf";
  }
}

export function getExportFilename(
  reportId: string,
  format: ReportExportFormat,
) {
  const stamp = new Date().toISOString().slice(0, 10);
  return `radarstock-${reportId}-${stamp}.${format}`;
}

export async function renderReportExport(
  payload: ReportExportPayload,
  format: ReportExportFormat,
) {
  switch (format) {
    case "csv":
      return toCsv(payload);
    case "xlsx":
      return toXlsx(payload);
    case "pdf":
      return toPdf(payload);
  }
}
