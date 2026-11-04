"use client";

import { useState } from "react";
import type { PublicCategory } from "@radarstock/contracts";
import { Trash2Icon } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/toast";

type DeleteCategoryDialogProps = {
  category: PublicCategory;
  onClose: () => void;
  onDeleted: (id: string) => void;
};

export function DeleteCategoryDialog({
  category,
  onClose,
  onDeleted,
}: DeleteCategoryDialogProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleConfirmDelete() {
    setSubmitting(true);
    setServerError(null);

    try {
      const response = await fetch(`/api/categories/${category.id}`, {
        method: "DELETE",
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message =
          (data as { message?: string }).message ?? "Falha ao excluir.";
        setServerError(message);
        toast.add({ title: message, type: "error" });
        return;
      }

      toast.add({
        title: "Categoria excluída com sucesso.",
        type: "success",
      });
      onDeleted(category.id);
    } catch {
      const message =
        "Não foi possível conectar ao servidor. Tente novamente.";
      setServerError(message);
      toast.add({ title: message, type: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AlertDialog
      open
      onOpenChange={(open) => {
        if (!open && !submitting) onClose();
      }}
    >
      <AlertDialogContent
        size="default"
        className="max-w-md gap-0 overflow-hidden rounded-md border-2 border-border bg-card p-0 text-card-foreground ring-0 sm:max-w-md"
      >
        <AlertDialogHeader className="gap-3 place-items-start border-b-2 border-border p-4 text-left sm:place-items-start sm:text-left">
          <AlertDialogMedia className="mb-0 bg-critical/15 text-critical">
            <Trash2Icon />
          </AlertDialogMedia>
          <AlertDialogTitle className="font-heading text-base font-semibold tracking-tight">
            Excluir categoria
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground">
            Confirma a exclusão de {category.name}? Categorias com produtos
            vinculados não podem ser removidas.
          </AlertDialogDescription>
          {serverError ? (
            <p role="alert" className="text-sm text-destructive">
              {serverError}
            </p>
          ) : null}
        </AlertDialogHeader>
        <AlertDialogFooter className="mx-0 mb-0 rounded-none bg-card p-4 sm:justify-end">
          <AlertDialogCancel disabled={submitting} className="cursor-pointer">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            type="button"
            className="cursor-pointer"
            variant="destructive"
            disabled={submitting}
            data-testid="delete-category-confirm"
            onClick={handleConfirmDelete}
          >
            {submitting ? "Excluindo..." : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
