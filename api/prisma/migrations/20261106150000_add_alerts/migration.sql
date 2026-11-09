-- CreateEnum
CREATE TYPE "AlertKind" AS ENUM (
  'low_stock',
  'out_of_stock',
  'warehouse_near_capacity',
  'warehouse_full',
  'inventory_pending',
  'inventory_discrepancy',
  'inactive_with_stock'
);

-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('open', 'resolved');

-- CreateEnum
CREATE TYPE "AlertEntityType" AS ENUM ('product', 'warehouse', 'inventory_count');

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "kind" "AlertKind" NOT NULL,
    "status" "AlertStatus" NOT NULL DEFAULT 'open',
    "title" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "entityType" "AlertEntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "dedupeKey" TEXT NOT NULL,
    "payload" JSONB,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlertRule" (
    "id" TEXT NOT NULL,
    "kind" "AlertKind" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AlertRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Alert_dedupeKey_key" ON "Alert"("dedupeKey");

-- CreateIndex
CREATE INDEX "Alert_status_createdAt_idx" ON "Alert"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Alert_status_readAt_idx" ON "Alert"("status", "readAt");

-- CreateIndex
CREATE INDEX "Alert_entityType_entityId_idx" ON "Alert"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "AlertRule_kind_key" ON "AlertRule"("kind");

-- Seed default alert rules (enabled)
INSERT INTO "AlertRule" ("id", "kind", "enabled", "createdAt", "updatedAt")
VALUES
  ('alertrule_low_stock', 'low_stock', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('alertrule_out_of_stock', 'out_of_stock', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('alertrule_warehouse_near_capacity', 'warehouse_near_capacity', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('alertrule_warehouse_full', 'warehouse_full', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('alertrule_inventory_pending', 'inventory_pending', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('alertrule_inventory_discrepancy', 'inventory_discrepancy', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('alertrule_inactive_with_stock', 'inactive_with_stock', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
