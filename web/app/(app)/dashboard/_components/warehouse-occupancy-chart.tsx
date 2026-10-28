"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { displayValue } from "@/lib/utils";

type WarehouseSlice = {
  name: string;
  value: number;
  color: string;
};

type WarehouseOccupancyChartProps = {
  data?: WarehouseSlice[];
};

const EMPTY_SLICE = [{ name: "vazio", value: 1, color: "var(--muted)" }];

export function WarehouseOccupancyChart({
  data = [],
}: WarehouseOccupancyChartProps) {
  const hasData = data.length > 0;
  const chartData = hasData ? data : EMPTY_SLICE;
  const warehouseCount = hasData ? data.length : null;

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
              {displayValue(warehouseCount)}
            </span>
            <span className="text-xs text-muted-foreground">galpões</span>
          </div>
        </div>

        <ul className="w-full space-y-2 text-sm">
          {hasData ? (
            data.map((item) => (
              <li key={item.name} className="flex items-center gap-2">
                <span
                  className="size-2.5 shrink-0 rounded-full"
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
