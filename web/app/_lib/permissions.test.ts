import { describe, expect, it } from "vitest";
import {
  getPagePermission,
  hasPermission,
  ROLE_PERMISSIONS,
  type Permission,
  type UserRole,
} from "@radarstock/contracts";

const cases: Array<{
  role: UserRole;
  allowed: readonly Permission[];
  denied: readonly Permission[];
}> = [
  {
    role: "admin",
    allowed: [
      "products.write",
      "warehouses.write",
      "categories.write",
      "movements.write",
      "sales.write",
      "receipts.write",
      "inventory.write",
      "reports.export",
      "settings.read",
      "alertRules.write",
      "team.manage",
    ],
    denied: [],
  },
  {
    role: "manager",
    allowed: [
      "products.write",
      "warehouses.write",
      "categories.write",
      "movements.write",
      "sales.write",
      "receipts.write",
      "inventory.write",
      "reports.export",
      "settings.read",
    ],
    denied: ["alertRules.write", "team.manage"],
  },
  {
    role: "operator",
    allowed: [
      "movements.write",
      "sales.write",
      "receipts.write",
      "inventory.write",
    ],
    denied: [
      "products.write",
      "warehouses.write",
      "categories.write",
      "reports.export",
      "settings.read",
      "alertRules.write",
      "team.manage",
    ],
  },
  {
    role: "viewer",
    allowed: [],
    denied: [
      "products.write",
      "movements.write",
      "reports.export",
      "settings.read",
      "team.manage",
    ],
  },
];

describe("ROLE_PERMISSIONS matrix", () => {
  it.each(cases)("$role matches the frozen matrix", ({ role, allowed, denied }) => {
    for (const permission of allowed) {
      expect(hasPermission(role, permission)).toBe(true);
      expect(ROLE_PERMISSIONS[role]).toContain(permission);
    }
    for (const permission of denied) {
      expect(hasPermission(role, permission)).toBe(false);
    }
  });

  it("rejects unknown or empty roles", () => {
    expect(hasPermission(null, "products.write")).toBe(false);
    expect(hasPermission(undefined, "products.write")).toBe(false);
    expect(hasPermission("ghost", "products.write")).toBe(false);
  });
});

describe("getPagePermission", () => {
  it("gates team and settings", () => {
    expect(getPagePermission("/team")).toBe("team.manage");
    expect(getPagePermission("/team/x")).toBe("team.manage");
    expect(getPagePermission("/settings")).toBe("settings.read");
    expect(getPagePermission("/dashboard")).toBeNull();
    expect(getPagePermission("/products")).toBeNull();
  });
});
