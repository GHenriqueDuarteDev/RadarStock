"use client";

import { useState } from "react";
import {
  publicInventoryCountSchema,
  type PublicInventoryCount,
} from "@radarstock/contracts";
import { ClipboardListIcon } from "lucide-react";

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

type CancelInventoryDialogProps = {
  inventory: PublicInventoryCount;
  onClose: () => void;
  onCancelled: (inventory: PublicInventoryCount) => void;
};

export function CancelInventoryDialog({
  inventory,
  onClose,
  onCancelled,
}: CancelInventoryDialogProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const isDraft = inventory.status === "draft";

  async function handleConfirmCancel() {
    setSubmitting(true);
    setServerError(null);

    try {
      const response = await fetch(`/api/inventory/${inventory.id}/cancel`, {
        method: "POST",
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message =
          (data as { message?: string }).message ??
          "Falha ao cancelar inventário.";
        setServerError(message);
        toast.add({ title: message, type: "error" });
        return;
      }

      const cancelled = publicInventoryCountSchema.parse(data);
      toast.add({
        title: isDraft
          ? "Rascunho de inventário cancelado."
          : "Inventário cancelado e estoque restaurado.",
        type: "success",
      });
      onCancelled(cancelled);
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
            <ClipboardListIcon />
          </AlertDialogMedia>
          <AlertDialogTitle className="font-heading text-base font-semibold tracking-tight">
            Cancelar inventário
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground">
            {isDraft
              ? `Descartar o rascunho ${inventory.code}? Nenhum estoque será alterado.`
              : `Cancelar ${inventory.code}? O saldo voltará para as quantidades esperadas da contagem.`}
          </AlertDialogDescription>
          {serverError ? (
            <p role="alert" className="text-sm text-destructive">
              {serverError}
            </p>
          ) : null}
        </AlertDialogHeader>
        <AlertDialogFooter className="mx-0 mb-0 rounded-none bg-card p-4 sm:justify-end">
          <AlertDialogCancel disabled={submitting} className="cursor-pointer">
            Voltar
          </AlertDialogCancel>
          <AlertDialogAction
            type="button"
            className="cursor-pointer"
            variant="destructive"
            disabled={submitting}
            data-testid="cancel-inventory-confirm"
            onClick={handleConfirmCancel}
          >
            {submitting ? "Cancelando..." : "Cancelar inventário"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
