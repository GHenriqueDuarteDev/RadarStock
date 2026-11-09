"use client";

import { useState } from "react";
import type { AlertKind, AlertRule } from "@radarstock/contracts";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/components/ui/toast";

import { updateAlertRuleAction } from "../_actions";

type AlertRulesPanelProps = {
  rules: AlertRule[];
  canEdit: boolean;
};

const ruleCopy: Record<AlertKind, { title: string; description: string }> = {
  low_stock: {
    title: "Estoque baixo",
    description: "Produto ativo com saldo abaixo do mínimo cadastrado.",
  },
  out_of_stock: {
    title: "Estoque zerado",
    description: "Produto ativo sem saldo em nenhum galpão.",
  },
  warehouse_near_capacity: {
    title: "Galpão próximo da capacidade",
    description: "Ocupação igual ou acima de 80% da capacidade.",
  },
  warehouse_full: {
    title: "Galpão cheio",
    description: "Ocupação igual ou acima da capacidade máxima.",
  },
  inventory_pending: {
    title: "Inventário pendente",
    description: "Inventário em rascunho aguardando confirmação.",
  },
  inventory_discrepancy: {
    title: "Inventário com divergências",
    description: "Itens contados diferem do esperado.",
  },
  inactive_with_stock: {
    title: "Produto inativo com saldo",
    description: "Produto desativado que ainda possui estoque.",
  },
};

export function AlertRulesPanel({ rules, canEdit }: AlertRulesPanelProps) {
  const [pendingKind, setPendingKind] = useState<AlertKind | null>(null);

  async function handleToggle(rule: AlertRule) {
    if (!canEdit || pendingKind) {
      return;
    }

    const nextEnabled = !rule.enabled;
    setPendingKind(rule.kind);

    try {
      const result = await updateAlertRuleAction(rule.kind, {
        enabled: nextEnabled,
      });

      if (!result.ok) {
        throw new Error(result.message);
      }

      toast.add({
        title: nextEnabled ? "Gatilho ativado" : "Gatilho desativado",
        type: "success",
      });
    } catch (error) {
      toast.add({
        title:
          error instanceof Error
            ? error.message
            : "Não foi possível atualizar o gatilho.",
        type: "error",
      });
    } finally {
      setPendingKind(null);
    }
  }

  return (
    <Card className="w-fit gap-0 p-0" data-testid="alert-rules-panel">
      <CardHeader className="border-b-2 border-border">
        <CardTitle>Gatilhos de alerta</CardTitle>
        <CardDescription>
          Ative ou desative os alertas automáticos da operação.
          {!canEdit
            ? " Apenas administradores podem alterar estes gatilhos."
            : null}
        </CardDescription>
      </CardHeader>

      <CardContent className="px-0 py-0">
        <ul>
          {rules.map((rule, index) => {
            const copy = ruleCopy[rule.kind];
            const busy = pendingKind === rule.kind;
            return (
              <li
                key={rule.kind}
                className={`flex items-start justify-between gap-4 px-4 py-3 ${
                  index > 0 ? "border-t-2 border-border" : ""
                }`}
              >
                <div className="min-w-0 space-y-0.5">
                  <p className="text-sm font-semibold tracking-tight">
                    {copy.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {copy.description}
                  </p>
                </div>
                <label className="flex shrink-0 cursor-pointer items-center gap-2 pt-0.5">
                  <Badge variant={rule.enabled ? "success" : "default"}>
                    {rule.enabled ? "Ativo" : "Inativo"}
                  </Badge>
                  <input
                    type="checkbox"
                    className="size-4 accent-primary"
                    checked={rule.enabled}
                    disabled={!canEdit || busy}
                    data-testid={`alert-rule-${rule.kind}`}
                    aria-label={`${copy.title}: ${rule.enabled ? "ativo" : "inativo"}`}
                    onChange={() => {
                      void handleToggle(rule);
                    }}
                  />
                </label>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
