import type {
  AlertEntityType,
  AlertKind,
  ListAlertsQuery,
  UpdateAlertRule,
} from "@radarstock/contracts";
import { prisma } from "../src/db";

const NEAR_CAPACITY_RATIO = 0.8;
const DEFAULT_LIST_LIMIT = 20;

const ALL_KINDS: AlertKind[] = [
  "low_stock",
  "out_of_stock",
  "warehouse_near_capacity",
  "warehouse_full",
  "inventory_pending",
  "inventory_discrepancy",
  "inactive_with_stock",
];

type AlertPayload = Record<string, unknown>;

type OpenAlertInput = {
  kind: AlertKind;
  title: string;
  detail: string;
  entityType: AlertEntityType;
  entityId: string;
  dedupeKey: string;
  payload?: AlertPayload | null;
};

function dedupeKey(
  kind: AlertKind,
  entityType: AlertEntityType,
  entityId: string,
) {
  return `${kind}:${entityType}:${entityId}`;
}

function toPublicAlert(alert: {
  id: string;
  kind: AlertKind;
  status: "open" | "resolved";
  title: string;
  detail: string;
  entityType: AlertEntityType;
  entityId: string;
  payload: unknown;
  readAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt: Date | null;
}) {
  const payload =
    alert.payload !== null &&
    typeof alert.payload === "object" &&
    !Array.isArray(alert.payload)
      ? (alert.payload as Record<string, unknown>)
      : null;

  return {
    id: alert.id,
    kind: alert.kind,
    status: alert.status,
    title: alert.title,
    detail: alert.detail,
    entityType: alert.entityType,
    entityId: alert.entityId,
    payload,
    readAt: alert.readAt,
    createdAt: alert.createdAt,
    updatedAt: alert.updatedAt,
    resolvedAt: alert.resolvedAt,
  };
}

async function isKindEnabled(kind: AlertKind) {
  const rule = await prisma.alertRule.findUnique({
    where: { kind },
    select: { enabled: true },
  });
  return rule?.enabled ?? true;
}

async function openOrRefresh(input: OpenAlertInput) {
  const existing = await prisma.alert.findUnique({
    where: { dedupeKey: input.dedupeKey },
  });

  if (!existing) {
    await prisma.alert.create({
      data: {
        kind: input.kind,
        status: "open",
        title: input.title,
        detail: input.detail,
        entityType: input.entityType,
        entityId: input.entityId,
        dedupeKey: input.dedupeKey,
        payload: input.payload ?? undefined,
        readAt: null,
        resolvedAt: null,
      },
    });
    return;
  }

  await prisma.alert.update({
    where: { id: existing.id },
    data: {
      status: "open",
      title: input.title,
      detail: input.detail,
      payload: input.payload ?? undefined,
      resolvedAt: null,
      ...(existing.status === "resolved" ? { readAt: null } : {}),
    },
  });
}

async function resolveByDedupeKey(key: string) {
  const existing = await prisma.alert.findUnique({
    where: { dedupeKey: key },
    select: { id: true, status: true },
  });

  if (!existing || existing.status !== "open") {
    return;
  }

  await prisma.alert.update({
    where: { id: existing.id },
    data: {
      status: "resolved",
      resolvedAt: new Date(),
    },
  });
}

async function setCondition(
  enabled: boolean,
  condition: boolean,
  input: OpenAlertInput,
) {
  if (!enabled || !condition) {
    await resolveByDedupeKey(input.dedupeKey);
    return;
  }
  await openOrRefresh(input);
}

async function evaluateProduct(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      name: true,
      sku: true,
      minStock: true,
      status: true,
      stockBalances: { select: { quantity: true } },
    },
  });

  if (!product) {
    return;
  }

  const totalQty = product.stockBalances.reduce(
    (sum, balance) => sum + balance.quantity,
    0,
  );

  const lowEnabled = await isKindEnabled("low_stock");
  const outEnabled = await isKindEnabled("out_of_stock");
  const inactiveEnabled = await isKindEnabled("inactive_with_stock");

  const outKey = dedupeKey("out_of_stock", "product", product.id);
  const lowKey = dedupeKey("low_stock", "product", product.id);
  const inactiveKey = dedupeKey("inactive_with_stock", "product", product.id);

  const isInactiveWithStock =
    product.status === "inactive" && totalQty > 0;
  const isOutOfStock = product.status === "active" && totalQty === 0;
  const isLowStock =
    product.status === "active" &&
    totalQty > 0 &&
    totalQty < product.minStock;

  await setCondition(inactiveEnabled, isInactiveWithStock, {
    kind: "inactive_with_stock",
    title: "Produto inativo com saldo",
    detail: `${product.name} (${product.sku}) está inativo com ${totalQty} em estoque`,
    entityType: "product",
    entityId: product.id,
    dedupeKey: inactiveKey,
    payload: { quantity: totalQty, sku: product.sku },
  });

  await setCondition(outEnabled, isOutOfStock, {
    kind: "out_of_stock",
    title: "Estoque zerado",
    detail: `${product.name} (${product.sku}) está sem saldo`,
    entityType: "product",
    entityId: product.id,
    dedupeKey: outKey,
    payload: { quantity: totalQty, minStock: product.minStock, sku: product.sku },
  });

  await setCondition(lowEnabled, isLowStock, {
    kind: "low_stock",
    title: "Estoque baixo",
    detail: `${product.name} (${product.sku}) com ${totalQty} (mínimo ${product.minStock})`,
    entityType: "product",
    entityId: product.id,
    dedupeKey: lowKey,
    payload: { quantity: totalQty, minStock: product.minStock, sku: product.sku },
  });
}

async function evaluateWarehouse(warehouseId: string) {
  const warehouse = await prisma.warehouse.findUnique({
    where: { id: warehouseId },
    select: {
      id: true,
      name: true,
      code: true,
      capacity: true,
      stockBalances: { select: { quantity: true } },
    },
  });

  if (!warehouse) {
    return;
  }

  const nearEnabled = await isKindEnabled("warehouse_near_capacity");
  const fullEnabled = await isKindEnabled("warehouse_full");

  const nearKey = dedupeKey(
    "warehouse_near_capacity",
    "warehouse",
    warehouse.id,
  );
  const fullKey = dedupeKey("warehouse_full", "warehouse", warehouse.id);

  const totalQty = warehouse.stockBalances.reduce(
    (sum, balance) => sum + balance.quantity,
    0,
  );

  const capacity = warehouse.capacity;
  const hasCapacity = capacity !== null && capacity > 0;
  const ratio = hasCapacity ? totalQty / capacity : 0;
  const isFull = hasCapacity && totalQty >= capacity;
  const isNear = hasCapacity && !isFull && ratio >= NEAR_CAPACITY_RATIO;

  await setCondition(fullEnabled, isFull, {
    kind: "warehouse_full",
    title: "Galpão cheio",
    detail: `${warehouse.name} (${warehouse.code}) atingiu a capacidade (${totalQty}/${capacity})`,
    entityType: "warehouse",
    entityId: warehouse.id,
    dedupeKey: fullKey,
    payload: { quantity: totalQty, capacity },
  });

  await setCondition(nearEnabled, isNear, {
    kind: "warehouse_near_capacity",
    title: "Galpão próximo da capacidade",
    detail: `${warehouse.name} (${warehouse.code}) em ${Math.round(ratio * 100)}% da capacidade (${totalQty}/${capacity})`,
    entityType: "warehouse",
    entityId: warehouse.id,
    dedupeKey: nearKey,
    payload: { quantity: totalQty, capacity, ratio },
  });
}

async function evaluateInventory(inventoryId: string) {
  const inventory = await prisma.inventoryCount.findUnique({
    where: { id: inventoryId },
    select: {
      id: true,
      code: true,
      status: true,
      items: { select: { expectedQty: true, countedQty: true } },
    },
  });

  if (!inventory) {
    return;
  }

  const pendingEnabled = await isKindEnabled("inventory_pending");
  const discrepancyEnabled = await isKindEnabled("inventory_discrepancy");

  const pendingKey = dedupeKey(
    "inventory_pending",
    "inventory_count",
    inventory.id,
  );
  const discrepancyKey = dedupeKey(
    "inventory_discrepancy",
    "inventory_count",
    inventory.id,
  );

  const isPending = inventory.status === "draft";
  const hasDiscrepancy =
    (inventory.status === "draft" || inventory.status === "confirmed") &&
    inventory.items.some(
      (item) => item.countedQty !== 0 && item.countedQty !== item.expectedQty,
    );

  await setCondition(pendingEnabled, isPending, {
    kind: "inventory_pending",
    title: "Inventário pendente",
    detail: `${inventory.code} está em rascunho`,
    entityType: "inventory_count",
    entityId: inventory.id,
    dedupeKey: pendingKey,
    payload: { code: inventory.code, status: inventory.status },
  });

  await setCondition(discrepancyEnabled, hasDiscrepancy, {
    kind: "inventory_discrepancy",
    title: "Inventário com divergências",
    detail: `${inventory.code} possui itens com contagem divergente`,
    entityType: "inventory_count",
    entityId: inventory.id,
    dedupeKey: discrepancyKey,
    payload: { code: inventory.code, status: inventory.status },
  });
}

async function reevaluateAll() {
  const [products, warehouses, inventories] = await Promise.all([
    prisma.product.findMany({ select: { id: true } }),
    prisma.warehouse.findMany({ select: { id: true } }),
    prisma.inventoryCount.findMany({ select: { id: true } }),
  ]);

  for (const product of products) {
    await evaluateProduct(product.id);
  }
  for (const warehouse of warehouses) {
    await evaluateWarehouse(warehouse.id);
  }
  for (const inventory of inventories) {
    await evaluateInventory(inventory.id);
  }
}

async function listOpen(query?: Partial<ListAlertsQuery>) {
  const limit = query?.limit ?? DEFAULT_LIST_LIMIT;
  const status = query?.status ?? "open";

  const [items, totalOpen, unreadCount] = await Promise.all([
    prisma.alert.findMany({
      where: { status },
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
    prisma.alert.count({ where: { status: "open" } }),
    prisma.alert.count({
      where: { status: "open", readAt: null },
    }),
  ]);

  return {
    status: 200 as const,
    data: {
      items: items.map(toPublicAlert),
      totalOpen,
      unreadCount,
    },
  };
}

async function getBadgeCounts() {
  const [totalOpen, unreadCount] = await Promise.all([
    prisma.alert.count({ where: { status: "open" } }),
    prisma.alert.count({
      where: { status: "open", readAt: null },
    }),
  ]);

  return {
    status: 200 as const,
    data: { totalOpen, unreadCount },
  };
}

async function markAllRead(ids?: string[]) {
  const where =
    ids && ids.length > 0
      ? { status: "open" as const, readAt: null, id: { in: ids } }
      : { status: "open" as const, readAt: null };

  await prisma.alert.updateMany({
    where,
    data: { readAt: new Date() },
  });

  return getBadgeCounts();
}

async function listRules() {
  const rules = await prisma.alertRule.findMany({
    orderBy: { kind: "asc" },
  });

  const byKind = new Map(rules.map((rule) => [rule.kind, rule]));
  const items = ALL_KINDS.map((kind) => {
    const rule = byKind.get(kind);
    return {
      kind,
      enabled: rule?.enabled ?? true,
      updatedAt: rule?.updatedAt ?? new Date(0),
    };
  });

  return {
    status: 200 as const,
    data: { items },
  };
}

async function updateRule(kind: AlertKind, input: UpdateAlertRule) {
  if (!ALL_KINDS.includes(kind)) {
    return {
      status: 404 as const,
      data: { message: "Gatilho não encontrado." },
    };
  }

  const rule = await prisma.alertRule.upsert({
    where: { kind },
    update: { enabled: input.enabled },
    create: { kind, enabled: input.enabled },
  });

  await reevaluateAll();

  return {
    status: 200 as const,
    data: {
      kind: rule.kind,
      enabled: rule.enabled,
      updatedAt: rule.updatedAt,
    },
  };
}

export const alertsService = {
  evaluateProduct,
  evaluateWarehouse,
  evaluateInventory,
  reevaluateAll,
  listOpen,
  getBadgeCounts,
  markAllRead,
  listRules,
  updateRule,
};
