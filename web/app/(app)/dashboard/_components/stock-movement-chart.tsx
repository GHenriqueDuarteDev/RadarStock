"use client";

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

type MovementPoint = {
  day: string;
  entradas: number;
  saidas: number;
};

type StockMovementChartProps = {
  data?: MovementPoint[];
};

export function StockMovementChart({ data = [] }: StockMovementChartProps) {
  const hasData = data.length > 0;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Movimentação do estoque</CardTitle>
        <CardDescription>Entradas e saídas nos últimos 7 dias</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative h-64 w-full">
          {hasData ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} barGap={4}>
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
                    borderRadius: "var(--radius)",
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
            <div className="flex h-full items-center justify-center rounded-md border-2 border-dashed border-border bg-muted/40">
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
