import type {
  LowStockQuery,
  LowStockRow,
  MovementsReportQuery,
  ReceiptsReportQuery,
  ReportCatalog,
  ReportId,
  ReportPreview,
  SalesReportQuery,
  StockPositionQuery,
  StockPositionRow,
  WarehouseOccupancyQuery,
  WarehouseOccupancyRow,
} from "@radarstock/contracts";
import {
  REPORT_EXPORT_MAX_ROWS,
  REPORT_PREVIEW_LIMIT,
} from "@radarstock/contracts";
import { prisma } from "../src/db";

export const REPORT_CATALOG: ReportCatalog = {
  items: [
    {
      id: "stock-position",
      title: "Posição de estoque",
      description: "Saldo atual por produto e galpão, com valor a custo.",
      supportsPeriod: false,
    },
    {
      id: "low-stock",
      title: "Estoque baixo",
      description: "Produtos com quantidade total abaixo do estoque mínimo.",
      supportsPeriod: false,
    },
    {
      id: "warehouse-occupancy",
      title: "Ocupação de galpões",
      description: "Quantidade ocupada versus capacidade cadastrada.",
      supportsPeriod: false,
    },
    {
      id: "movements",
      title: "Movimentações",
      description: "Entradas, saídas, transferências e ajustes no período.",
      supportsPeriod: true,
    },
    {
      id: "sales",
      title: "Vendas",
      description: "Vendas registradas no período, com totais e status.",
      supportsPeriod: true,
    },
    {
      id: "receipts",
      title: "Recebimentos",
      description: "Recebimentos no período, com custo e fornecedor.",
      supportsPeriod: true,
    },
  ],
};

function decimalToNumber(value: { toString(): string } | number) {
  return typeof value === "number" ? value : Number(value.toString());
}

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

export function resolveReportPeriod(from?: Date, to?: Date) {
  const resolvedTo = endOfDay(to ?? new Date());
  const resolvedFrom = from
    ? startOfDay(from)
    : (() => {
        const start = startOfDay(resolvedTo);
        start.setDate(start.getDate() - 29);
        return start;
      })();

  return { from: resolvedFrom, to: resolvedTo };
}

type ProductForLowStock = {
  id: string;
  name: string;
  sku: string;
  minStock: number;
  category: { name: string } | null;
  stockBalances: Array<{ quantity: number }>;
};

export function buildLowStockRows(
  products: ProductForLowStock[],
  includeZero: boolean,
): LowStockRow[] {
  const rows: LowStockRow[] = [];

  for (const product of products) {
    const totalQuantity = product.stockBalances.reduce(
      (sum, balance) => sum + balance.quantity,
      0,
    );

    if (totalQuantity >= product.minStock) {
      continue;
    }

    if (!includeZero && totalQuantity === 0) {
      continue;
    }

    rows.push({
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      categoryName: product.category?.name ?? null,
      minStock: product.minStock,
      totalQuantity,
      deficit: product.minStock - totalQuantity,
    });
  }

  rows.sort((a, b) => b.deficit - a.deficit || a.productName.localeCompare(b.productName));
  return rows;
}

type WarehouseForOccupancy = {
  id: string;
  name: string;
  code: string;
  status: "active" | "inactive";
  capacity: number | null;
  stockBalances: Array<{ quantity: number }>;
};

export function buildWarehouseOccupancyRows(
  warehouses: WarehouseForOccupancy[],
): WarehouseOccupancyRow[] {
  return warehouses
    .map((warehouse) => {
      const occupiedQty = warehouse.stockBalances.reduce(
        (sum, balance) => sum + balance.quantity,
        0,
      );
      const capacity = warehouse.capacity;
      const occupancyPercent =
        capacity !== null && capacity > 0
          ? Math.round((occupiedQty / capacity) * 1000) / 10
          : null;

      return {
        warehouseId: warehouse.id,
        warehouseName: warehouse.name,
        warehouseCode: warehouse.code,
        status: warehouse.status,
        capacity,
        occupiedQty,
        occupancyPercent,
      };
    })
    .sort((a, b) => a.warehouseName.localeCompare(b.warehouseName));
}

function toPreview<T>(
  reportId: ReportId,
  rows: T[],
  summary: ReportPreview["summary"],
): ReportPreview {
  const truncated = rows.length > REPORT_PREVIEW_LIMIT;
  const previewRows = rows.slice(0, REPORT_PREVIEW_LIMIT);

  return {
    reportId,
    generatedAt: new Date(),
    totalRows: rows.length,
    previewLimit: REPORT_PREVIEW_LIMIT,
    truncated,
    summary,
    rows: previewRows,
  } as ReportPreview;
}

async function getStockPositionRows(query: StockPositionQuery) {
  const onlyPositive = query.onlyPositive !== false;

  const balances = await prisma.stockBalance.findMany({
    where: {
      ...(query.warehouseId ? { warehouseId: query.warehouseId } : {}),
      ...(onlyPositive ? { quantity: { gt: 0 } } : {}),
      product: {
        ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      },
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          sku: true,
          cost: true,
          category: { select: { name: true } },
        },
      },
      warehouse: { select: { id: true, name: true } },
    },
    orderBy: [{ warehouse: { name: "asc" } }, { product: { name: "asc" } }],
  });

  const rows: StockPositionRow[] = balances.map((balance) => {
    const unitCost = decimalToNumber(balance.product.cost);
    return {
      productId: balance.product.id,
      productName: balance.product.name,
      productSku: balance.product.sku,
      categoryName: balance.product.category?.name ?? null,
      warehouseId: balance.warehouse.id,
      warehouseName: balance.warehouse.name,
      quantity: balance.quantity,
      unitCost,
      stockValue: balance.quantity * unitCost,
    };
  });

  return rows;
}

async function getLowStockRows(query: LowStockQuery) {
  const includeZero = query.includeZero !== false;
  const products = await prisma.product.findMany({
    where: { status: "active" },
    select: {
      id: true,
      name: true,
      sku: true,
      minStock: true,
      category: { select: { name: true } },
      stockBalances: { select: { quantity: true } },
    },
  });

  return buildLowStockRows(products, includeZero);
}

async function getWarehouseOccupancyRows(query: WarehouseOccupancyQuery) {
  const warehouses = await prisma.warehouse.findMany({
    where: query.status ? { status: query.status } : undefined,
    select: {
      id: true,
      name: true,
      code: true,
      status: true,
      capacity: true,
      stockBalances: { select: { quantity: true } },
    },
    orderBy: { name: "asc" },
  });

  return buildWarehouseOccupancyRows(warehouses);
}

async function getMovementsRows(query: MovementsReportQuery) {
  const { from, to } = resolveReportPeriod(query.from, query.to);

  const movements = await prisma.stockMovement.findMany({
    where: {
      createdAt: { gte: from, lte: to },
      ...(query.type ? { type: query.type } : {}),
    },
    include: {
      product: { select: { name: true, sku: true } },
      fromWarehouse: { select: { name: true } },
      toWarehouse: { select: { name: true } },
      user: { select: { email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const rows = movements.map((movement) => ({
    id: movement.id,
    createdAt: movement.createdAt,
    type: movement.type,
    productName: movement.product.name,
    productSku: movement.product.sku,
    quantity: movement.quantity,
    fromWarehouseName: movement.fromWarehouse?.name ?? null,
    toWarehouseName: movement.toWarehouse?.name ?? null,
    userName: movement.user.email,
    note: movement.note ?? null,
  }));

  return { rows, from, to };
}

async function getSalesRows(query: SalesReportQuery) {
  const { from, to } = resolveReportPeriod(query.from, query.to);

  const sales = await prisma.sale.findMany({
    where: {
      soldAt: { gte: from, lte: to },
      ...(query.status ? { status: query.status } : {}),
    },
    include: {
      warehouse: { select: { name: true } },
      createdBy: { select: { email: true } },
      items: { select: { id: true } },
    },
    orderBy: { soldAt: "desc" },
  });

  const rows = sales.map((sale) => ({
    id: sale.id,
    code: sale.code,
    status: sale.status,
    warehouseName: sale.warehouse.name,
    soldAt: sale.soldAt,
    totalAmount: decimalToNumber(sale.totalAmount),
    itemCount: sale.items.length,
    createdByName: sale.createdBy.email,
  }));

  return { rows, from, to };
}

async function getReceiptsRows(query: ReceiptsReportQuery) {
  const { from, to } = resolveReportPeriod(query.from, query.to);

  const receipts = await prisma.receipt.findMany({
    where: {
      receivedAt: { gte: from, lte: to },
      ...(query.status ? { status: query.status } : {}),
    },
    include: {
      warehouse: { select: { name: true } },
      createdBy: { select: { email: true } },
      items: { select: { quantity: true, unitCost: true } },
    },
    orderBy: { receivedAt: "desc" },
  });

  const rows = receipts.map((receipt) => {
    const totalCost = receipt.items.reduce(
      (sum, item) => sum + item.quantity * decimalToNumber(item.unitCost),
      0,
    );

    return {
      id: receipt.id,
      code: receipt.code,
      status: receipt.status,
      warehouseName: receipt.warehouse.name,
      supplierName: receipt.supplierName ?? null,
      receivedAt: receipt.receivedAt,
      itemCount: receipt.items.length,
      totalCost,
      createdByName: receipt.createdBy.email,
    };
  });

  return { rows, from, to };
}

function assertExportLimit(rowCount: number) {
  if (rowCount > REPORT_EXPORT_MAX_ROWS) {
    return {
      status: 413 as const,
      data: {
        message: `O relatório excede o limite de ${REPORT_EXPORT_MAX_ROWS} linhas. Refine os filtros.`,
      },
    };
  }
  return null;
}

async function getCatalog() {
  return { status: 200 as const, data: REPORT_CATALOG };
}

type ReportQueryBag = Record<string, string | undefined>;

function parseOptionalString(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

async function getPreview(reportId: ReportId, query: ReportQueryBag) {
  switch (reportId) {
    case "stock-position": {
      const rows = await getStockPositionRows({
        warehouseId: parseOptionalString(query.warehouseId),
        categoryId: parseOptionalString(query.categoryId),
        onlyPositive:
          query.onlyPositive === undefined
            ? undefined
            : query.onlyPositive !== "false" && query.onlyPositive !== "0",
      });
      const summary = {
        lineCount: rows.length,
        totalQuantity: rows.reduce((sum, row) => sum + row.quantity, 0),
        totalValue: rows.reduce((sum, row) => sum + row.stockValue, 0),
      };
      return {
        status: 200 as const,
        data: toPreview("stock-position", rows, summary),
      };
    }
    case "low-stock": {
      const rows = await getLowStockRows({
        includeZero:
          query.includeZero === undefined
            ? undefined
            : query.includeZero !== "false" && query.includeZero !== "0",
      });
      const summary = {
        productCount: rows.length,
        zeroStockCount: rows.filter((row) => row.totalQuantity === 0).length,
        totalDeficit: rows.reduce((sum, row) => sum + row.deficit, 0),
      };
      return {
        status: 200 as const,
        data: toPreview("low-stock", rows, summary),
      };
    }
    case "warehouse-occupancy": {
      const status =
        query.status === "active" || query.status === "inactive"
          ? query.status
          : undefined;
      const rows = await getWarehouseOccupancyRows({ status });
      const capacities = rows
        .map((row) => row.capacity)
        .filter((value): value is number => value !== null);
      const summary = {
        warehouseCount: rows.length,
        totalOccupied: rows.reduce((sum, row) => sum + row.occupiedQty, 0),
        totalCapacity:
          capacities.length > 0
            ? capacities.reduce((sum, value) => sum + value, 0)
            : null,
      };
      return {
        status: 200 as const,
        data: toPreview("warehouse-occupancy", rows, summary),
      };
    }
    case "movements": {
      const { rows, from, to } = await getMovementsRows({
        from: query.from ? new Date(query.from) : undefined,
        to: query.to ? new Date(query.to) : undefined,
        type:
          query.type === "in" ||
          query.type === "out" ||
          query.type === "transfer" ||
          query.type === "adjustment"
            ? query.type
            : undefined,
      });
      const summary = {
        movementCount: rows.length,
        totalQuantity: rows.reduce((sum, row) => sum + row.quantity, 0),
        from,
        to,
      };
      return {
        status: 200 as const,
        data: toPreview("movements", rows, summary),
      };
    }
    case "sales": {
      const { rows, from, to } = await getSalesRows({
        from: query.from ? new Date(query.from) : undefined,
        to: query.to ? new Date(query.to) : undefined,
        status:
          query.status === "draft" ||
          query.status === "confirmed" ||
          query.status === "cancelled"
            ? query.status
            : undefined,
      });
      const summary = {
        saleCount: rows.length,
        totalAmount: rows.reduce((sum, row) => sum + row.totalAmount, 0),
        from,
        to,
      };
      return {
        status: 200 as const,
        data: toPreview("sales", rows, summary),
      };
    }
    case "receipts": {
      const { rows, from, to } = await getReceiptsRows({
        from: query.from ? new Date(query.from) : undefined,
        to: query.to ? new Date(query.to) : undefined,
        status:
          query.status === "draft" ||
          query.status === "confirmed" ||
          query.status === "cancelled"
            ? query.status
            : undefined,
      });
      const summary = {
        receiptCount: rows.length,
        totalCost: rows.reduce((sum, row) => sum + row.totalCost, 0),
        from,
        to,
      };
      return {
        status: 200 as const,
        data: toPreview("receipts", rows, summary),
      };
    }
  }
}

export type ReportExportPayload = {
  reportId: ReportId;
  title: string;
  columns: string[];
  rows: Array<Array<string | number | null>>;
};

async function getExportPayload(
  reportId: ReportId,
  query: ReportQueryBag,
): Promise<
  | { status: 200; data: ReportExportPayload }
  | { status: 413; data: { message: string } }
> {
  const catalogItem = REPORT_CATALOG.items.find((item) => item.id === reportId);
  const title = catalogItem?.title ?? reportId;

  switch (reportId) {
    case "stock-position": {
      const rows = await getStockPositionRows({
        warehouseId: parseOptionalString(query.warehouseId),
        categoryId: parseOptionalString(query.categoryId),
        onlyPositive:
          query.onlyPositive === undefined
            ? undefined
            : query.onlyPositive !== "false" && query.onlyPositive !== "0",
      });
      const limitError = assertExportLimit(rows.length);
      if (limitError) {
        return limitError;
      }
      return {
        status: 200,
        data: {
          reportId,
          title,
          columns: [
            "Produto",
            "SKU",
            "Categoria",
            "Galpão",
            "Quantidade",
            "Custo unitário",
            "Valor",
          ],
          rows: rows.map((row) => [
            row.productName,
            row.productSku,
            row.categoryName,
            row.warehouseName,
            row.quantity,
            row.unitCost,
            row.stockValue,
          ]),
        },
      };
    }
    case "low-stock": {
      const rows = await getLowStockRows({
        includeZero:
          query.includeZero === undefined
            ? undefined
            : query.includeZero !== "false" && query.includeZero !== "0",
      });
      const limitError = assertExportLimit(rows.length);
      if (limitError) {
        return limitError;
      }
      return {
        status: 200,
        data: {
          reportId,
          title,
          columns: [
            "Produto",
            "SKU",
            "Categoria",
            "Mínimo",
            "Quantidade",
            "Déficit",
          ],
          rows: rows.map((row) => [
            row.productName,
            row.productSku,
            row.categoryName,
            row.minStock,
            row.totalQuantity,
            row.deficit,
          ]),
        },
      };
    }
    case "warehouse-occupancy": {
      const status =
        query.status === "active" || query.status === "inactive"
          ? query.status
          : undefined;
      const rows = await getWarehouseOccupancyRows({ status });
      const limitError = assertExportLimit(rows.length);
      if (limitError) {
        return limitError;
      }
      return {
        status: 200,
        data: {
          reportId,
          title,
          columns: [
            "Galpão",
            "Código",
            "Status",
            "Capacidade",
            "Ocupado",
            "Ocupação %",
          ],
          rows: rows.map((row) => [
            row.warehouseName,
            row.warehouseCode,
            row.status,
            row.capacity,
            row.occupiedQty,
            row.occupancyPercent,
          ]),
        },
      };
    }
    case "movements": {
      const { rows } = await getMovementsRows({
        from: query.from ? new Date(query.from) : undefined,
        to: query.to ? new Date(query.to) : undefined,
        type:
          query.type === "in" ||
          query.type === "out" ||
          query.type === "transfer" ||
          query.type === "adjustment"
            ? query.type
            : undefined,
      });
      const limitError = assertExportLimit(rows.length);
      if (limitError) {
        return limitError;
      }
      return {
        status: 200,
        data: {
          reportId,
          title,
          columns: [
            "Data",
            "Tipo",
            "Produto",
            "SKU",
            "Quantidade",
            "Origem",
            "Destino",
            "Usuário",
            "Observação",
          ],
          rows: rows.map((row) => [
            row.createdAt.toISOString(),
            row.type,
            row.productName,
            row.productSku,
            row.quantity,
            row.fromWarehouseName,
            row.toWarehouseName,
            row.userName,
            row.note,
          ]),
        },
      };
    }
    case "sales": {
      const { rows } = await getSalesRows({
        from: query.from ? new Date(query.from) : undefined,
        to: query.to ? new Date(query.to) : undefined,
        status:
          query.status === "draft" ||
          query.status === "confirmed" ||
          query.status === "cancelled"
            ? query.status
            : undefined,
      });
      const limitError = assertExportLimit(rows.length);
      if (limitError) {
        return limitError;
      }
      return {
        status: 200,
        data: {
          reportId,
          title,
          columns: [
            "Código",
            "Status",
            "Galpão",
            "Data",
            "Total",
            "Itens",
            "Criado por",
          ],
          rows: rows.map((row) => [
            row.code,
            row.status,
            row.warehouseName,
            row.soldAt.toISOString(),
            row.totalAmount,
            row.itemCount,
            row.createdByName,
          ]),
        },
      };
    }
    case "receipts": {
      const { rows } = await getReceiptsRows({
        from: query.from ? new Date(query.from) : undefined,
        to: query.to ? new Date(query.to) : undefined,
        status:
          query.status === "draft" ||
          query.status === "confirmed" ||
          query.status === "cancelled"
            ? query.status
            : undefined,
      });
      const limitError = assertExportLimit(rows.length);
      if (limitError) {
        return limitError;
      }
      return {
        status: 200,
        data: {
          reportId,
          title,
          columns: [
            "Código",
            "Status",
            "Galpão",
            "Fornecedor",
            "Data",
            "Itens",
            "Custo total",
            "Criado por",
          ],
          rows: rows.map((row) => [
            row.code,
            row.status,
            row.warehouseName,
            row.supplierName,
            row.receivedAt.toISOString(),
            row.itemCount,
            row.totalCost,
            row.createdByName,
          ]),
        },
      };
    }
  }
}

export const reportsService = {
  getCatalog,
  getPreview,
  getExportPayload,
};
