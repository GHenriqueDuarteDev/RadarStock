"use client";

import { useState } from "react";
import { publicSaleSchema, type PublicSale } from "@radarstock/contracts";
import { ShoppingCartIcon } from "lucide-react";

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

type CancelSaleDialogProps = {
  sale: PublicSale;
  onClose: () => void;
  onCancelled: (sale: PublicSale) => void;
};

export function CancelSaleDialog({
  sale,
  onClose,
  onCancelled,
}: CancelSaleDialogProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleConfirmCancel() {
    setSubmitting(true);
    setServerError(null);

    try {
      const response = await fetch(`/api/sales/${sale.id}/cancel`, {
        method: "POST",
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message =
          (data as { message?: string }).message ?? "Falha ao cancelar venda.";
        setServerError(message);
        toast.add({ title: message, type: "error" });
        return;
      }

      const cancelled = publicSaleSchema.parse(data);
      toast.add({
        title: "Venda cancelada e estoque estornado.",
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
            <ShoppingCartIcon />
          </AlertDialogMedia>
          <AlertDialogTitle className="font-heading text-base font-semibold tracking-tight">
            Cancelar venda
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground">
            Confirma o cancelamento de {sale.code}? O estoque dos itens será
            estornado ao galpão de origem.
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
            data-testid="cancel-sale-confirm"
            onClick={handleConfirmCancel}
          >
            {submitting ? "Cancelando..." : "Cancelar venda"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
