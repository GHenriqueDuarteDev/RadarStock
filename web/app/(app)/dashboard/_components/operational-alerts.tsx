import type { AlertKind, PublicAlert } from "@radarstock/contracts";
import {
  AlertTriangleIcon,
  ClipboardListIcon,
  PackageIcon,
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
  data?: PublicAlert[];
  totalOpen?: number | null;
};

const kindIcon: Record<AlertKind, LucideIcon> = {
  low_stock: AlertTriangleIcon,
  out_of_stock: PackageIcon,
  warehouse_near_capacity: WarehouseIcon,
  warehouse_full: WarehouseIcon,
  inventory_pending: ClipboardListIcon,
  inventory_discrepancy: AlertTriangleIcon,
  inactive_with_stock: PackageXIcon,
};

const kindTone: Record<AlertKind, string> = {
  low_stock: "bg-warning/15 text-warning-foreground",
  out_of_stock: "bg-critical/15 text-critical",
  warehouse_near_capacity: "bg-warning/15 text-warning-foreground",
  warehouse_full: "bg-critical/15 text-critical",
  inventory_pending: "bg-warning/15 text-warning-foreground",
  inventory_discrepancy: "bg-critical/15 text-critical",
  inactive_with_stock: "bg-muted text-muted-foreground",
};

export function OperationalAlerts({
  data = [],
  totalOpen = null,
}: OperationalAlertsProps) {
  return (
    <Card className="max-h-115">
      <CardHeader>
        <CardTitle>Alertas operacionais</CardTitle>
        <CardAction>
          <span className="rounded-none bg-critical/15 px-2 py-0.5 font-mono text-xs font-semibold text-critical">
            {displayValue(totalOpen)} alertas
          </span>
        </CardAction>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 space-y-2 overflow-y-auto">
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
                  <p className="text-sm text-muted-foreground">
                    {alert.detail}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
