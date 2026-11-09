import { describe, expect, it } from "vitest";

import { getRequiredPermission, hasRequiredRole } from "./route-access";

describe("route-access", () => {
  it("requires team.manage for /team", () => {
    expect(getRequiredPermission("/team")).toBe("team.manage");
    expect(hasRequiredRole("/team", "admin")).toBe(true);
    expect(hasRequiredRole("/team", "manager")).toBe(false);
    expect(hasRequiredRole("/team", "operator")).toBe(false);
  });

  it("requires settings.read for /settings (manager allowed)", () => {
    expect(getRequiredPermission("/settings")).toBe("settings.read");
    expect(hasRequiredRole("/settings", "admin")).toBe(true);
    expect(hasRequiredRole("/settings", "manager")).toBe(true);
    expect(hasRequiredRole("/settings", "operator")).toBe(false);
    expect(hasRequiredRole("/settings", "viewer")).toBe(false);
  });

  it("allows operational routes for any authenticated role", () => {
    expect(getRequiredPermission("/dashboard")).toBeNull();
    expect(hasRequiredRole("/products", "viewer")).toBe(true);
  });
});
