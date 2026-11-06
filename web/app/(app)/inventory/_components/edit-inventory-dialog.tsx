"use client";

import { useState } from "react";
import {
  publicInventoryCountSchema,
  updateInventoryCountInputSchema,
  type PublicInventoryCount,
} from "@radarstock/contracts";
import { useFieldArray, useForm } from "react-hook-form";

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

type EditInventoryFormValues = {
  countedAt: string;
  notes: string;
  items: Array<{
    productId: string;
    productName: string;
    productSku: string;
    expectedQty: number;
    countedQty: number;
  }>;
};

type EditInventoryDialogProps = {
  inventory: PublicInventoryCount;
  onClose: () => void;
  onSaved: (inventory: PublicInventoryCount) => void;
};

function toDateTimeLocalValue(value: Date | string | null) {
  if (!value) {
    return "";
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function EditInventoryDialog({
  inventory,
  onClose,
  onSaved,
}: EditInventoryDialogProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<EditInventoryFormValues>({
    defaultValues: {
      countedAt: toDateTimeLocalValue(inventory.countedAt),
      notes: inventory.notes ?? "",
      items: inventory.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        productSku: item.productSku,
        expectedQty: item.expectedQty,
        countedQty: item.countedQty,
      })),
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "items",
  });

  async function onSubmit(values: EditInventoryFormValues) {
    setServerError(null);

    const payload = {
      countedAt:
        values.countedAt.trim() === "" ? null : new Date(values.countedAt),
      notes: values.notes.trim() === "" ? null : values.notes,
      items: values.items.map((item) => ({
        productId: item.productId,
        countedQty: Number(item.countedQty),
      })),
    };

    const parsed = updateInventoryCountInputSchema.safeParse(payload);
    if (!parsed.success) {
      setServerError("Dados de inventário inválidos.");
      return;
    }

    try {
      const response = await fetch(`/api/inventory/${inventory.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const data = await response.json();

      if (!response.ok) {
        const message = data.message ?? "Falha ao atualizar inventário.";
        setServerError(message);
        toast.add({ title: message, type: "error" });
        return;
      }

      const updated = publicInventoryCountSchema.parse(data);
      toast.add({
        title: "Contagem atualizada.",
        type: "success",
      });
      onSaved(updated);
    } catch {
      const message =
        "Não foi possível conectar ao servidor. Tente novamente.";
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
          <DialogTitle>Registrar contagem</DialogTitle>
          <DialogDescription>
            Informe a quantidade contada. Esperado vem do saldo do galpão e não
            pode ser editado. Contado 0 = ainda não contado.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <DialogBody className="space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="edit-inventory-code">Código</FieldLabel>
                <Input
                  id="edit-inventory-code"
                  data-testid="edit-inventory-code"
                  value={inventory.code}
                  disabled
                  readOnly
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="edit-inventory-warehouse">
                  Galpão
                </FieldLabel>
                <Input
                  id="edit-inventory-warehouse"
                  data-testid="edit-inventory-warehouse"
                  value={inventory.warehouseName}
                  disabled
                  readOnly
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="edit-inventory-counted-at">
                  Data da contagem
                </FieldLabel>
                <Input
                  id="edit-inventory-counted-at"
                  data-testid="edit-inventory-counted-at"
                  type="datetime-local"
                  {...form.register("countedAt")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="edit-inventory-notes">Notas</FieldLabel>
                <Input
                  id="edit-inventory-notes"
                  data-testid="edit-inventory-notes"
                  {...form.register("notes")}
                />
              </Field>
            </FieldGroup>

            <div className="space-y-3">
              <p className="text-sm font-semibold">Itens</p>
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="space-y-3 rounded-md border-2 border-border p-3"
                  data-testid={`edit-inventory-item-${index}`}
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {field.productName}{" "}
                      <span className="font-mono text-muted-foreground">
                        ({field.productSku})
                      </span>
                    </p>
                    <p className="font-mono text-sm text-muted-foreground">
                      Esperado: {field.expectedQty}
                    </p>
                  </div>
                  <Field>
                    <FieldLabel
                      htmlFor={`edit-inventory-item-counted-${index}`}
                    >
                      Contado
                    </FieldLabel>
                    <Input
                      id={`edit-inventory-item-counted-${index}`}
                      data-testid={`edit-inventory-item-counted-${index}`}
                      type="number"
                      min={0}
                      step={1}
                      {...form.register(`items.${index}.countedQty`, {
                        required: true,
                        valueAsNumber: true,
                      })}
                    />
                  </Field>
                  <input
                    type="hidden"
                    {...form.register(`items.${index}.productId`)}
                  />
                </div>
              ))}
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
              onClick={onClose}
              disabled={form.formState.isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              data-testid="edit-inventory-save"
            >
              {form.formState.isSubmitting ? "Salvando..." : "Salvar contagem"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
