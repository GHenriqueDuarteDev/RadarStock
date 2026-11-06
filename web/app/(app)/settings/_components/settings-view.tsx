"use client";

import { useCallback, useEffect, useState } from "react";
import {
  alertRulesListSchema,
  publicCategorySchema,
  publicUserSchema,
  type AlertRule,
  type PublicCategory,
  type PublicUser,
} from "@radarstock/contracts";
import { z } from "zod";

import { PageHeader } from "@/components/page-header";

import { AlertRulesPanel } from "./alert-rules-panel";
import { CategoriesTable } from "./categories-table";
import { CreateCategorySheet } from "./create-category-sheet";
import { DeleteCategoryDialog } from "./delete-category-dialog";
import { EditCategorySheet } from "./edit-category-sheet";

const categoriesListSchema = z.array(publicCategorySchema);

type SettingsSheet =
  | { type: "create" }
  | { type: "edit"; category: PublicCategory }
  | { type: "delete"; category: PublicCategory }
  | null;

async function readErrorMessage(response: Response) {
  try {
    const data = (await response.json()) as { message?: string };
    return data.message ?? "Não foi possível concluir a operação.";
  } catch {
    return "Não foi possível concluir a operação.";
  }
}

export function SettingsView() {
  const [categories, setCategories] = useState<PublicCategory[]>([]);
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [currentUser, setCurrentUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sheet, setSheet] = useState<SettingsSheet>(null);

  const loadCategories = useCallback(async () => {
    const response = await fetch("/api/categories");
    if (!response.ok) {
      throw new Error(await readErrorMessage(response));
    }
    const data = categoriesListSchema.parse(await response.json());
    setCategories(data);
  }, []);

  const loadRules = useCallback(async () => {
    const response = await fetch("/api/alert-rules");
    if (!response.ok) {
      throw new Error(await readErrorMessage(response));
    }
    const data = alertRulesListSchema.parse(await response.json());
    setRules(data.items);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function initialLoad() {
      setLoading(true);
      setLoadError(null);
      try {
        const meResponse = await fetch("/api/me");
        if (meResponse.ok) {
          const me = publicUserSchema.parse(await meResponse.json());
          if (!cancelled) {
            setCurrentUser(me);
          }
        }
        await Promise.all([loadCategories(), loadRules()]);
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            err instanceof Error
              ? err.message
              : "Não foi possível carregar as configurações.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void initialLoad();

    return () => {
      cancelled = true;
    };
  }, [loadCategories, loadRules]);

  function handleCreated(created: PublicCategory) {
    setCategories((current) =>
      [...current, created].sort((a, b) => a.name.localeCompare(b.name)),
    );
    setSheet(null);
  }

  function handleSaved(updated: PublicCategory) {
    setCategories((current) =>
      current
        .map((category) => (category.id === updated.id ? updated : category))
        .sort((a, b) => a.name.localeCompare(b.name)),
    );
    setSheet(null);
  }

  function handleDeleted(id: string) {
    setCategories((current) =>
      current.filter((category) => category.id !== id),
    );
    setSheet(null);
  }

  function handleRuleChange(updated: AlertRule) {
    setRules((current) =>
      current.map((rule) => (rule.kind === updated.kind ? updated : rule)),
    );
  }

  const canEditRules = currentUser?.role === "admin";

  return (
    <>
      <PageHeader
        category="Sistema"
        title="Configurações"
        description="Gerencie categorias do catálogo e gatilhos de alertas operacionais."
      />
      {loading ? (
        <p
          className="text-sm text-muted-foreground"
          data-testid="settings-loading"
        >
          Carregando configurações...
        </p>
      ) : loadError ? (
        <p role="alert" className="text-sm text-destructive">
          {loadError}
        </p>
      ) : (
        <div className="space-y-4 flex gap-5">
          <CategoriesTable
            data={categories}
            onCreate={() => setSheet({ type: "create" })}
            onEdit={(category) => setSheet({ type: "edit", category })}
            onDelete={(category) => setSheet({ type: "delete", category })}
          />
          <AlertRulesPanel
            rules={rules}
            canEdit={canEditRules}
            onRuleChange={handleRuleChange}
          />
        </div>
      )}
      {sheet?.type === "create" ? (
        <CreateCategorySheet
          onClose={() => setSheet(null)}
          onCreated={handleCreated}
        />
      ) : null}
      {sheet?.type === "edit" ? (
        <EditCategorySheet
          key={sheet.category.id}
          category={sheet.category}
          onClose={() => setSheet(null)}
          onSaved={handleSaved}
        />
      ) : null}
      {sheet?.type === "delete" ? (
        <DeleteCategoryDialog
          key={sheet.category.id}
          category={sheet.category}
          onClose={() => setSheet(null)}
          onDeleted={handleDeleted}
        />
      ) : null}
    </>
  );
}
