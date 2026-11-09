"use client";

import { useEffect, useState } from "react";
import {
  inventoryCountInputSchema,
  type InventoryCountInput,
  type PublicInventoryCount,
  type PublicWarehouse,
  type WarehouseBalanceItem,
} from "@radarstock/contracts";

import {
  createInventoryAction,
  getWarehouseBalancesAction,
} from "../_actions";
import { useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";

const selectClassName =
  "h-11 w-full min-w-0 rounded-md border-2 border-input bg-card px-3 py-2 font-mono text-base outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm";

type CreateInventoryFormValues = {
  warehouseId: string;
  countedAt: string;
  notes: string;
};

type CreateInventoryDialogProps = {
  warehouses: PublicWarehouse[];
  onClose: () => void;
  onCreated: (inventory: PublicInventoryCount) => void;
};

function toDateTimeLocalValue(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function CreateInventoryDialog({
  warehouses,
  onClose,
  onCreated,
}: CreateInventoryDialogProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [previewItems, setPreviewItems] = useState<WarehouseBalanceItem[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const form = useForm<CreateInventoryFormValues>({
    defaultValues: {
      warehouseId: warehouses[0]?.id ?? "",
      countedAt: toDateTimeLocalValue(new Date()),
      notes: "",
    },
  });

  const warehouseId = useWatch({ control: form.control, name: "warehouseId" });

  useEffect(() => {
    if (!warehouseId) {
      return;
    }

    let cancelled = false;

    const timer = setTimeout(() => {
      void (async () => {
        setPreviewLoading(true);
        setPreviewError(null);
        try {
          const result = await getWarehouseBalancesAction(warehouseId);
          if (!result.ok) {
            throw new Error(result.message);
          }
          if (!cancelled) {
            setPreviewItems(result.data.items);
          }
        } catch (err) {
          if (!cancelled) {
            setPreviewItems([]);
            setPreviewError(
              err instanceof Error
                ? err.message
                : "Falha ao carregar saldos do galpão.",
            );
          }
        } finally {
          if (!cancelled) {
            setPreviewLoading(false);
          }
        }
      })();
    }, 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [warehouseId]);

  const visiblePreviewItems = warehouseId ? previewItems : [];

  async function onSubmit(values: CreateInventoryFormValues) {
    setServerError(null);

    const payload: InventoryCountInput = {
      warehouseId: values.warehouseId,
      countedAt:
        values.countedAt.trim() === "" ? undefined : new Date(values.countedAt),
      notes: values.notes.trim() === "" ? undefined : values.notes,
    };

    const parsed = inventoryCountInputSchema.safeParse(payload);
    if (!parsed.success) {
      setServerError("Dados de inventário inválidos.");
      return;
    }

    try {
      const result = await createInventoryAction(parsed.data);

      if (!result.ok) {
        setServerError(result.message);
        toast.add({ title: result.message, type: "error" });
        return;
      }

      toast.add({
        title: "Inventário criado como rascunho.",
        type: "success",
      });
      onCreated(result.data);
    } catch {
      const message = "Não foi possível conectar ao servidor. Tente novamente.";
      setServerError(message);
      toast.add({ title: message, type: "error" });
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo inventário</DialogTitle>
          <DialogDescription>
            Selecione o galpão para abrir a contagem com o saldo esperado já
            preenchido.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <DialogBody className="space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="create-inventory-warehouse">
                  Galpão
                </FieldLabel>
                <select
                  id="create-inventory-warehouse"
                  data-testid="create-inventory-warehouse"
                  className={selectClassName}
                  {...form.register("warehouseId", { required: true })}
                >
                  {warehouses.map((warehouse) => (
                    <option key={warehouse.id} value={warehouse.id}>
                      {warehouse.name} ({warehouse.code})
                    </option>
                  ))}
                </select>
              </Field>
              <Field>
                <FieldLabel htmlFor="create-inventory-counted-at">
                  Data da contagem
                </FieldLabel>
                <Input
                  id="create-inventory-counted-at"
                  data-testid="create-inventory-counted-at"
                  type="datetime-local"
                  {...form.register("countedAt")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="create-inventory-notes">Notas</FieldLabel>
                <Input
                  id="create-inventory-notes"
                  data-testid="create-inventory-notes"
                  {...form.register("notes")}
                />
              </Field>
            </FieldGroup>

            <div className="space-y-2">
              <p className="text-sm font-semibold">Itens do galpão</p>
              {previewLoading ? (
                <p className="text-sm text-muted-foreground">
                  Carregando saldos...
                </p>
              ) : previewError ? (
                <p role="alert" className="text-sm text-destructive">
                  {previewError}
                </p>
              ) : visiblePreviewItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhum produto com saldo neste galpão.
                </p>
              ) : (
                <div
                  className="space-y-2 rounded-md border-2 border-border p-3"
                  data-testid="create-inventory-preview"
                >
                  {visiblePreviewItems.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <span>
                        {item.productName}{" "}
                        <span className="font-mono text-muted-foreground">
                          ({item.productSku})
                        </span>
                      </span>
                      <span className="font-mono">
                        Esperado: {item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {serverError ? (
              <p role="alert" className="text-sm text-destructive">
                {serverError}
              </p>
            ) : null}
          </DialogBody>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={onClose}
              disabled={form.formState.isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="cursor-pointer"
              disabled={
                form.formState.isSubmitting ||
                warehouses.length === 0 ||
                visiblePreviewItems.length === 0
              }
              data-testid="create-inventory-save"
            >
              {form.formState.isSubmitting ? "Abrindo..." : "Abrir contagem"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
