import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { displayValue } from "@/lib/utils";

type MetricCardProps = {
  label: string;
  value: string | number | null | undefined;
  icon?: LucideIcon;
  hint?: string;
};

export function MetricCard({ label, value, icon: Icon, hint }: MetricCardProps) {
  return (
    <Card size="sm">
      <CardContent className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          {Icon ? (
            <div className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Icon className="size-4" />
            </div>
          ) : (
            <span />
          )}
          {hint ? (
            <span className="font-mono text-xs text-muted-foreground">
              {hint}
            </span>
          ) : null}
        </div>
        <div>
          <p className="font-mono text-2xl font-bold tracking-tight">
            {displayValue(value)}
          </p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

type MetricCardsProps = {
  children: ReactNode;
};

export function MetricCards({ children }: MetricCardsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{children}</div>
  );
}
