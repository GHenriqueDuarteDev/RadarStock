"use client";

import { useCallback, useEffect, useState } from "react";
import {
  dashboardAlertsSchema,
  dashboardMetricsSchema,
  dashboardMovementsSeriesSchema,
  dashboardRecentMovementsSchema,
  dashboardWarehouseDistributionSchema,
  type DashboardAlerts,
  type DashboardDays,
  type DashboardMetrics,
  type DashboardMovementsSeries,
  type DashboardRecentMovements,
  type DashboardWarehouseDistribution,
} from "@radarstock/contracts";

import { DashboardMetrics as DashboardMetricsCards } from "./dashboard-metrics";
import { OperationalAlerts } from "./operational-alerts";
import { RecentMovements } from "./recent-movements";
import { StockMovementChart } from "./stock-movement-chart";
import { WarehouseOccupancyChart } from "./warehouse-occupancy-chart";

export function DashboardView() {
  const [days, setDays] = useState<DashboardDays>(7);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [series, setSeries] = useState<DashboardMovementsSeries | null>(null);
  const [distribution, setDistribution] =
    useState<DashboardWarehouseDistribution | null>(null);
  const [recent, setRecent] = useState<DashboardRecentMovements | null>(null);
  const [alerts, setAlerts] = useState<DashboardAlerts | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadSeries = useCallback(async (nextDays: DashboardDays) => {
    const response = await fetch(
      `/api/dashboard/movements-series?days=${nextDays}`,
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message ?? "Falha ao carregar série de movimentos.");
    }
    setSeries(dashboardMovementsSeriesSchema.parse(data));
  }, []);

  const loadDashboard = useCallback(async (initialDays: DashboardDays) => {
    setLoading(true);
    setLoadError(null);
    try {
      const [metricsRes, seriesRes, distributionRes, recentRes, alertsRes] =
        await Promise.all([
          fetch("/api/dashboard/metrics"),
          fetch(`/api/dashboard/movements-series?days=${initialDays}`),
          fetch("/api/dashboard/warehouse-distribution"),
          fetch("/api/dashboard/recent-movements"),
          fetch("/api/dashboard/alerts"),
        ]);

      const [
        metricsData,
        seriesData,
        distributionData,
        recentData,
        alertsData,
      ] = await Promise.all([
        metricsRes.json(),
        seriesRes.json(),
        distributionRes.json(),
        recentRes.json(),
        alertsRes.json(),
      ]);

      if (!metricsRes.ok) {
        throw new Error(metricsData.message ?? "Falha ao carregar métricas.");
      }
      if (!seriesRes.ok) {
        throw new Error(
          seriesData.message ?? "Falha ao carregar série de movimentos.",
        );
      }
      if (!distributionRes.ok) {
        throw new Error(
          distributionData.message ?? "Falha ao carregar distribuição.",
        );
      }
      if (!recentRes.ok) {
        throw new Error(
          recentData.message ?? "Falha ao carregar movimentações.",
        );
      }
      if (!alertsRes.ok) {
        throw new Error(alertsData.message ?? "Falha ao carregar alertas.");
      }

      setMetrics(dashboardMetricsSchema.parse(metricsData));
      setSeries(dashboardMovementsSeriesSchema.parse(seriesData));
      setDistribution(
        dashboardWarehouseDistributionSchema.parse(distributionData),
      );
      setRecent(dashboardRecentMovementsSchema.parse(recentData));
      setAlerts(dashboardAlertsSchema.parse(alertsData));
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar a visão geral.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard(7);
  }, [loadDashboard]);

  async function handleDaysChange(nextDays: DashboardDays) {
    setDays(nextDays);
    try {
      await loadSeries(nextDays);
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Falha ao atualizar série de movimentos.",
      );
    }
  }

  if (loading) {
    return (
      <p
        className="text-sm text-muted-foreground"
        data-testid="dashboard-loading"
      >
        Carregando visão geral...
      </p>
    );
  }

  if (loadError) {
    return (
      <p role="alert" className="text-sm text-destructive">
        {loadError}
      </p>
    );
  }

  return (
    <>
      <DashboardMetricsCards data={metrics} />
      <div className="grid gap-3 lg:grid-cols-2">
        <StockMovementChart
          data={series?.points ?? []}
          days={days}
          onDaysChange={handleDaysChange}
        />
        <WarehouseOccupancyChart
          slices={distribution?.slices ?? []}
          warehouseCount={distribution?.warehouseCount ?? 0}
        />
        <RecentMovements data={recent?.items ?? []} />
        <OperationalAlerts
          data={alerts?.items ?? []}
          totalCount={alerts?.totalCount ?? 0}
        />
      </div>
    </>
  );
}
