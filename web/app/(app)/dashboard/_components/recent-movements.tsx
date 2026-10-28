import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { displayValue } from "@/lib/utils";

type MovementType = "entrada" | "venda" | "transferencia" | "ajuste";

type RecentMovement = {
  id: string;
  product: string | null;
  sku: string | null;
  type: MovementType | null;
  quantity: number | null;
  location: string | null;
  responsible: string | null;
};

type RecentMovementsProps = {
  data?: RecentMovement[];
};

const typeLabel: Record<MovementType, string> = {
  entrada: "Entrada",
  venda: "Venda",
  transferencia: "Transferência",
  ajuste: "Ajuste",
};

const typeClassName: Record<MovementType, string> = {
  entrada: "bg-tag-entrada text-tag-entrada-foreground",
  venda: "bg-tag-saida text-tag-saida-foreground",
  transferencia: "bg-muted text-foreground",
  ajuste: "bg-tag-pending text-tag-pending-foreground",
};

function TypeBadge({ type }: { type: MovementType | null }) {
  if (!type) {
    return (
      <span className="font-mono text-xs text-muted-foreground">
        {displayValue(null)}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${typeClassName[type]}`}
    >
      {typeLabel[type]}
    </span>
  );
}

function formatQuantity(value: number | null) {
  if (value === null || value === undefined) {
    return displayValue(value);
  }
  const sign = value > 0 ? "+" : "";
  return `${sign}${value}`;
}

export function RecentMovements({ data = [] }: RecentMovementsProps) {
  return (
    <Card className="h-full">
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
                  <td className="px-4 py-3">
                    <div className="space-y-0.5">
                      <p className="font-semibold">{displayValue(null)}</p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {displayValue(null)}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <TypeBadge type={null} />
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    {displayValue(null)}
                  </td>
                  <td className="px-4 py-3">{displayValue(null)}</td>
                  <td className="px-4 py-3">{displayValue(null)}</td>
                </tr>
              ) : (
                data.map((movement) => (
                  <tr key={movement.id} className="border-t-2 border-border">
                    <td className="px-4 py-3">
                      <div className="space-y-0.5">
                        <p className="font-semibold">
                          {displayValue(movement.product)}
                        </p>
                        <p className="font-mono text-xs text-muted-foreground">
                          {displayValue(movement.sku)}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <TypeBadge type={movement.type} />
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      {formatQuantity(movement.quantity)}
                    </td>
                    <td className="px-4 py-3">
                      {displayValue(movement.location)}
                    </td>
                    <td className="px-4 py-3">
                      {displayValue(movement.responsible)}
                    </td>
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
