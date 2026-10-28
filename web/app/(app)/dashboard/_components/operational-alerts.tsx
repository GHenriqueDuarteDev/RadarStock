import type { LucideIcon } from "lucide-react";

import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { displayValue } from "@/lib/utils";

type AlertTone = "warning" | "critical" | "muted";

type OperationalAlert = {
  id: string;
  title: string;
  description: string;
  tone: AlertTone;
  icon: LucideIcon;
};

type OperationalAlertsProps = {
  data?: OperationalAlert[];
  totalCount?: number | null;
};

const toneClassName: Record<AlertTone, string> = {
  warning: "bg-warning/15 text-warning-foreground",
  critical: "bg-critical/15 text-critical",
  muted: "bg-muted text-muted-foreground",
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
          <span className="rounded-md bg-critical/15 px-2 py-0.5 font-mono text-xs font-semibold text-critical">
            {displayValue(totalCount)} alertas
          </span>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-2">
        {data.length === 0 ? (
          <div className="rounded-md border-2 border-border bg-muted/40 px-3 py-4 text-sm text-muted-foreground">
            Nenhum alerta no momento. {displayValue(null)}
          </div>
        ) : (
          data.map((alert) => (
            <div
              key={alert.id}
              className="flex items-start gap-3 rounded-md border-2 border-border px-3 py-3"
            >
              <div
                className={`flex size-8 shrink-0 items-center justify-center rounded-md ${toneClassName[alert.tone]}`}
              >
                <alert.icon className="size-4" />
              </div>
              <div className="min-w-0 space-y-0.5">
                <p className="text-sm font-semibold tracking-tight">
                  {alert.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  {alert.description}
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
