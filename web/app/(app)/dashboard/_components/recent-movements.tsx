import type { DashboardRecentMovement } from "@radarstock/contracts";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { displayValue } from "@/lib/utils";

type RecentMovementsProps = {
  data?: DashboardRecentMovement[];
};

type BadgeKind = "entrada" | "venda" | "saida" | "transferencia" | "ajuste";

const typeLabel: Record<BadgeKind, string> = {
  entrada: "Entrada",
  venda: "Venda",
  saida: "Saída",
  transferencia: "Transferência",
  ajuste: "Ajuste",
};

const typeVariant = {
  entrada: "entrada",
  venda: "saida",
  saida: "saida",
  transferencia: "default",
  ajuste: "pending",
} as const;

function toBadgeKind(movement: DashboardRecentMovement): BadgeKind {
  if (movement.type === "in") {
    return "entrada";
  }
  if (movement.type === "transfer") {
    return "transferencia";
  }
  if (movement.type === "adjustment") {
    return "ajuste";
  }
  if (movement.referenceType === "sale") {
    return "venda";
  }
  return "saida";
}

function formatQuantity(movement: DashboardRecentMovement) {
  if (movement.type === "out") {
    return `-${movement.quantity}`;
  }
  if (movement.type === "in") {
    return `+${movement.quantity}`;
  }
  return String(movement.quantity);
}

function formatLocation(movement: DashboardRecentMovement) {
  if (movement.fromWarehouseName && movement.toWarehouseName) {
    return `${movement.fromWarehouseName} → ${movement.toWarehouseName}`;
  }
  return movement.toWarehouseName ?? movement.fromWarehouseName ?? null;
}

function TypeBadge({ kind }: { kind: BadgeKind }) {
  return (
    <Badge variant={typeVariant[kind]} size="sm">
      {typeLabel[kind]}
    </Badge>
  );
}

export function RecentMovements({ data = [] }: RecentMovementsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Últimas movimentações</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted text-foreground">
              <tr>
                <th className="px-4 py-2 text-xs font-semibold tracking-wide uppercase">
                  Produto
                </th>
                <th className="px-4 py-2 text-xs font-semibold tracking-wide uppercase">
                  Tipo
                </th>
                <th className="px-4 py-2 text-right font-mono text-xs font-semibold tracking-wide uppercase">
                  Qtd.
                </th>
                <th className="px-4 py-2 text-xs font-semibold tracking-wide uppercase">
                  Local
                </th>
                <th className="px-4 py-2 text-xs font-semibold tracking-wide uppercase">
                  Responsável
                </th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr className="border-t-2 border-border">
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-sm text-muted-foreground"
                  >
                    Nenhuma movimentação recente. {displayValue(null)}
                  </td>
                </tr>
              ) : (
                data.map((movement) => (
                  <tr key={movement.id} className="border-t-2 border-border">
                    <td className="px-4 py-3">
                      <div className="space-y-0.5">
                        <p className="font-semibold">{movement.productName}</p>
                        <p className="font-mono text-xs text-muted-foreground">
                          {movement.productSku}
                        </p>
                      </div>
                    </td>
                    <td className="text-center">
                      <TypeBadge kind={toBadgeKind(movement)} />
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      {formatQuantity(movement)}
                    </td>
                    <td className="px-4 py-3">
                      {displayValue(formatLocation(movement))}
                    </td>
                    <td className="px-4 py-3">{movement.userName}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
