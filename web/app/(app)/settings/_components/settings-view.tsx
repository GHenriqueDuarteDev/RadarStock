"use client";

import { useCallback, useEffect, useState } from "react";
import {
  publicCategorySchema,
  type PublicCategory,
} from "@radarstock/contracts";
import { PlusIcon } from "lucide-react";
import { z } from "zod";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";

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
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sheet, setSheet] = useState<SettingsSheet>(null);

  const loadCategories = useCallback(async () => {
    setLoadError(null);
    const response = await fetch("/api/categories");
    if (!response.ok) {
      throw new Error(await readErrorMessage(response));
    }
    const data = categoriesListSchema.parse(await response.json());
    setCategories(data);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function initialLoad() {
      setLoading(true);
      try {
        await loadCategories();
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            err instanceof Error
              ? err.message
              : "Não foi possível carregar as categorias.",
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
  }, [loadCategories]);

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

  return (
    <>
      <PageHeader
        category="Sistema"
        title="Configurações"
        description="Gerencie configurações gerais da aplicação, começando pelas categorias do catálogo."
        action={
          <Button
            type="button"
            data-testid="new-category"
            onClick={() => setSheet({ type: "create" })}
          >
            <PlusIcon data-icon="inline-start" />
            Nova categoria
          </Button>
        }
      />
      {loading ? (
        <p
          className="text-sm text-muted-foreground"
          data-testid="settings-loading"
        >
          Carregando categorias...
        </p>
      ) : loadError ? (
        <p role="alert" className="text-sm text-destructive">
          {loadError}
        </p>
      ) : (
        <CategoriesTable
          data={categories}
          onEdit={(category) => setSheet({ type: "edit", category })}
          onDelete={(category) => setSheet({ type: "delete", category })}
        />
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
