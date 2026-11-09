import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextFunction, Request, Response } from "express";

const { findUniqueMock } = vi.hoisted(() => ({
  findUniqueMock: vi.fn(),
}));

vi.mock("../../../src/db", () => ({
  prisma: {
    user: {
      findUnique: findUniqueMock,
    },
  },
}));

import { requirePermission } from "../../../middlewares/auth-middleware";

function createMockRes() {
  const res = {
    locals: {} as Record<string, unknown>,
    statusCode: 200,
    body: null as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };
  return res as unknown as Response & {
    locals: Record<string, unknown>;
    statusCode: number;
    body: unknown;
  };
}

describe("requirePermission", () => {
  beforeEach(() => {
    findUniqueMock.mockReset();
  });

  it("returns 403 when viewer posts products.write", async () => {
    findUniqueMock.mockResolvedValue({
      id: "u1",
      role: "viewer",
      status: "active",
    });

    const middleware = requirePermission("products.write");
    const req = {} as Request;
    const res = createMockRes();
    res.locals.userId = "u1";
    const next = vi.fn() as NextFunction;

    await middleware(req, res, next);

    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ message: "Sem permissão." });
    expect(next).not.toHaveBeenCalled();
  });

  it("allows operator for movements.write", async () => {
    findUniqueMock.mockResolvedValue({
      id: "u2",
      role: "operator",
      status: "active",
    });

    const middleware = requirePermission("movements.write");
    const req = {} as Request;
    const res = createMockRes();
    res.locals.userId = "u2";
    const next = vi.fn() as NextFunction;

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.statusCode).toBe(200);
  });

  it("returns 403 when manager patches alertRules.write", async () => {
    findUniqueMock.mockResolvedValue({
      id: "u3",
      role: "manager",
      status: "active",
    });

    const middleware = requirePermission("alertRules.write");
    const req = {} as Request;
    const res = createMockRes();
    res.locals.userId = "u3";
    const next = vi.fn() as NextFunction;

    await middleware(req, res, next);

    expect(res.statusCode).toBe(403);
    expect(next).not.toHaveBeenCalled();
  });
});
