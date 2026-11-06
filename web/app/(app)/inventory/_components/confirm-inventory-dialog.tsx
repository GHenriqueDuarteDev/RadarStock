"use client";

import { useState } from "react";
import type { PublicInventoryCount } from "@radarstock/contracts";

import { confirmInventoryAction } from "../_actions";
import { ClipboardCheckIcon } from "lucide-react";

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

type ConfirmInventoryDialogProps = {
  inventory: PublicInventoryCount;
  onClose: () => void;
};

export function ConfirmInventoryDialog({
  inventory,
  onClose,
}: ConfirmInventoryDialogProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleConfirm() {
    setSubmitting(true);
    setServerError(null);

    try {
      const result = await confirmInventoryAction(inventory.id);

      if (!result.ok) {
        setServerError(result.message);
        toast.add({ title: result.message, type: "error" });
        return;
      }

      toast.add({
        title: "Inventário confirmado e estoque ajustado.",
        type: "success",
      });
      onClose();
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
          <AlertDialogMedia className="mb-0 bg-success/15 text-success">
            <ClipboardCheckIcon />
          </AlertDialogMedia>
          <AlertDialogTitle className="font-heading text-base font-semibold tracking-tight">
            Confirmar inventário
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground">
            Confirma {inventory.code}? O saldo de cada item no galpão passará
            a ser a quantidade contada.
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
            disabled={submitting}
            data-testid="confirm-inventory-confirm"
            onClick={handleConfirm}
          >
            {submitting ? "Confirmando..." : "Confirmar inventário"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
