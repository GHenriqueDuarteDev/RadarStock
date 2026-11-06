import type { DashboardAlertItem, DashboardAlertKind } from "@radarstock/contracts";
import {
  AlertTriangleIcon,
  ClipboardListIcon,
  PackageXIcon,
  WarehouseIcon,
  type LucideIcon,
} from "lucide-react";

import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { displayValue } from "@/lib/utils";

type OperationalAlertsProps = {
  data?: DashboardAlertItem[];
  totalCount?: number | null;
};

const kindIcon: Record<DashboardAlertKind, LucideIcon> = {
  "pending-counts": ClipboardListIcon,
  discrepancies: AlertTriangleIcon,
  "inactive-with-stock": PackageXIcon,
  "full-warehouses": WarehouseIcon,
};

const kindTone: Record<DashboardAlertKind, string> = {
  "pending-counts": "bg-warning/15 text-warning-foreground",
  discrepancies: "bg-critical/15 text-critical",
  "inactive-with-stock": "bg-muted text-muted-foreground",
  "full-warehouses": "bg-warning/15 text-warning-foreground",
};

export function OperationalAlerts({
  data = [],
  totalCount = null,
}: OperationalAlertsProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Alertas operacionais</CardTitle>
        <CardAction>
          <span className="rounded-none bg-critical/15 px-2 py-0.5 font-mono text-xs font-semibold text-critical">
            {displayValue(totalCount)} alertas
          </span>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-2">
        {data.length === 0 ? (
          <div className="rounded-none border-2 border-border bg-muted/40 px-3 py-4 text-sm text-muted-foreground">
            Nenhum alerta no momento.
          </div>
        ) : (
          data.map((alert) => {
            const Icon = kindIcon[alert.kind];
            return (
              <div
                key={alert.id}
                className="flex items-start gap-3 rounded-none border-2 border-border px-3 py-3"
                data-testid={`alert-${alert.kind}`}
              >
                <div
                  className={`flex size-8 shrink-0 items-center justify-center rounded-none ${kindTone[alert.kind]}`}
                >
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 space-y-0.5">
                  <p className="text-sm font-semibold tracking-tight">
                    {alert.title}
                  </p>
                  <p className="text-sm text-muted-foreground">{alert.detail}</p>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
