"use client";

import type { DashboardWarehouseSlice } from "@radarstock/contracts";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { displayValue } from "@/lib/utils";

type WarehouseOccupancyChartProps = {
  slices?: DashboardWarehouseSlice[];
  warehouseCount?: number;
};

const SLICE_COLORS = [
  "var(--primary)",
  "var(--success)",
  "var(--warning)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const EMPTY_SLICE = [{ name: "vazio", value: 1, color: "var(--muted)" }];

export function WarehouseOccupancyChart({
  slices = [],
  warehouseCount = 0,
}: WarehouseOccupancyChartProps) {
  const hasData = slices.length > 0;
  const chartData = hasData
    ? slices.map((slice, index) => ({
        name: slice.name,
        value: slice.valuePercent,
        color: SLICE_COLORS[index % SLICE_COLORS.length]!,
      }))
    : EMPTY_SLICE;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Estoque por galpão</CardTitle>
        <CardDescription>Distribuição do valor total</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
        <div className="relative size-48 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius="60%"
                outerRadius="85%"
                strokeWidth={0}
                isAnimationActive={hasData}
              >
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-2xl font-bold tracking-tight">
              {displayValue(hasData ? warehouseCount : null)}
            </span>
            <span className="text-xs text-muted-foreground">galpões</span>
          </div>
        </div>

        <ul className="w-full space-y-2 text-sm">
          {hasData ? (
            chartData.map((item) => (
              <li key={item.name} className="flex items-center gap-2">
                <span
                  className="size-2.5 shrink-0 rounded-none"
                  style={{ backgroundColor: item.color }}
                />
                <span className="flex-1 truncate">{item.name}</span>
                <span className="font-mono text-muted-foreground">
                  {item.value}%
                </span>
              </li>
            ))
          ) : (
            <li className="text-muted-foreground">{displayValue(null)}</li>
          )}
        </ul>
      </CardContent>
    </Card>
  );
}
