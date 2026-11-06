import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DashboardView } from "./dashboard-view";

function jsonResponse(data: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    json: async () => data,
  } as Response;
}

const sampleMetrics = {
  activeProducts: 12,
  stockValue: 428560,
  lowStock: 18,
  inactiveWarehouses: 2,
};

const sampleSeries7 = {
  days: 7 as const,
  points: [
    { date: "2026-01-01", in: 1, out: 0 },
    { date: "2026-01-02", in: 0, out: 2 },
    { date: "2026-01-03", in: 0, out: 0 },
    { date: "2026-01-04", in: 0, out: 0 },
    { date: "2026-01-05", in: 0, out: 0 },
    { date: "2026-01-06", in: 0, out: 0 },
    { date: "2026-01-07", in: 3, out: 1 },
  ],
};

const sampleSeries30 = {
  days: 30 as const,
  points: Array.from({ length: 30 }, (_, index) => ({
    date: `2026-01-${String(index + 1).padStart(2, "0")}`,
    in: 0,
    out: 0,
  })),
};

const sampleDistribution = {
  warehouseCount: 2,
  slices: [
    {
      warehouseId: "w1",
      name: "Central",
      valuePercent: 60,
      stockValue: 600,
    },
    {
      warehouseId: "w2",
      name: "Sul",
      valuePercent: 40,
      stockValue: 400,
    },
  ],
};

const sampleRecent = {
  items: [
    {
      id: "m1",
      productName: "Parafuso M6",
      productSku: "SKU-001",
      type: "in" as const,
      referenceType: null,
      quantity: 10,
      fromWarehouseName: null,
      toWarehouseName: "Central",
      userName: "Ana Silva",
      createdAt: "2026-01-01T10:00:00.000Z",
    },
  ],
};

const sampleAlerts = {
  totalCount: 3,
  items: [
    {
      id: "pending-counts",
      kind: "pending-counts" as const,
      title: "Contagem de inventário pendente",
      count: 3,
      detail: "3 inventários em rascunho",
    },
  ],
};

describe("DashboardView", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("renders metrics and sections from dashboard APIs", async () => {
    vi.mocked(fetch).mockImplementation(async (input) => {
      const url = String(input);
      if (url === "/api/dashboard/metrics") {
        return jsonResponse(sampleMetrics);
      }
      if (url.startsWith("/api/dashboard/movements-series")) {
        return jsonResponse(sampleSeries7);
      }
      if (url === "/api/dashboard/warehouse-distribution") {
        return jsonResponse(sampleDistribution);
      }
      if (url === "/api/dashboard/recent-movements") {
        return jsonResponse(sampleRecent);
      }
      if (url === "/api/dashboard/alerts") {
        return jsonResponse(sampleAlerts);
      }
      return jsonResponse({ message: "Not found" }, false, 404);
    });

    render(<DashboardView />);

    expect(await screen.findByText("Produtos ativos")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("Galpões inativos")).toBeInTheDocument();
    expect(screen.getByText("Parafuso M6")).toBeInTheDocument();
    expect(screen.getByText("Contagem de inventário pendente")).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith("/api/dashboard/metrics");
    expect(fetch).toHaveBeenCalledWith("/api/dashboard/movements-series?days=7");
  });

  it("refetches only movements series when days filter changes", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockImplementation(async (input) => {
      const url = String(input);
      if (url === "/api/dashboard/metrics") {
        return jsonResponse(sampleMetrics);
      }
      if (url.includes("days=30")) {
        return jsonResponse(sampleSeries30);
      }
      if (url.startsWith("/api/dashboard/movements-series")) {
        return jsonResponse(sampleSeries7);
      }
      if (url === "/api/dashboard/warehouse-distribution") {
        return jsonResponse(sampleDistribution);
      }
      if (url === "/api/dashboard/recent-movements") {
        return jsonResponse(sampleRecent);
      }
      if (url === "/api/dashboard/alerts") {
        return jsonResponse(sampleAlerts);
      }
      return jsonResponse({ message: "Not found" }, false, 404);
    });

    render(<DashboardView />);
    expect(await screen.findByText("Produtos ativos")).toBeInTheDocument();

    const callsBefore = vi.mocked(fetch).mock.calls.length;
    await user.click(screen.getByTestId("movements-days-30"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/dashboard/movements-series?days=30",
      );
    });

    const metricsCalls = vi
      .mocked(fetch)
      .mock.calls.filter(([url]) => String(url) === "/api/dashboard/metrics");
    expect(metricsCalls).toHaveLength(1);
    expect(vi.mocked(fetch).mock.calls.length).toBeGreaterThan(callsBefore);
  });
});
