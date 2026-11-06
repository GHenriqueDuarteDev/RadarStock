"use client";

import Link from "next/link";
import type { DashboardDays, DashboardMovementPoint } from "@radarstock/contracts";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { displayValue } from "@/lib/utils";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type StockMovementChartProps = {
  data?: DashboardMovementPoint[];
  days: DashboardDays;
};

const DAY_OPTIONS: DashboardDays[] = [7, 30, 90];

function shortDateLabel(date: string) {
  const [, month, day] = date.split("-");
  if (!month || !day) {
    return date;
  }
  return `${day}/${month}`;
}

export function StockMovementChart({
  data = [],
  days,
}: StockMovementChartProps) {
  const hasData = data.length > 0;
  const chartData = data.map((point) => ({
    day: shortDateLabel(point.date),
    entradas: point.in,
    saidas: point.out,
  }));

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="space-y-1">
            <CardTitle>Movimentação do estoque</CardTitle>
            <CardDescription>
              Entradas e saídas nos últimos {days} dias
            </CardDescription>
          </div>
          <div className="flex gap-1">
            {DAY_OPTIONS.map((option) => (
              <Link
                key={option}
                href={`/dashboard?days=${option}`}
                scroll={false}
                aria-current={days === option ? "true" : undefined}
                className={buttonVariants({
                  size: "sm",
                  variant: days === option ? "default" : "outline",
                })}
                data-testid={`movements-days-${option}`}
              >
                {option}d
              </Link>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative h-64 w-full">
          {hasData ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={4}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  className="text-xs"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  className="text-xs font-mono"
                />
                <Tooltip
                  cursor={{ fill: "var(--muted)" }}
                  contentStyle={{
                    border: "2px solid var(--border)",
                    borderRadius: "0",
                    background: "var(--card)",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="entradas"
                  name="Entradas"
                  fill="var(--success)"
                  radius={[2, 2, 0, 0]}
                />
                <Bar
                  dataKey="saidas"
                  name="Saídas"
                  fill="var(--primary)"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center rounded-none border-2 border-dashed border-border bg-muted/40">
              <p className="font-mono text-2xl font-bold text-muted-foreground">
                {displayValue(null)}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
