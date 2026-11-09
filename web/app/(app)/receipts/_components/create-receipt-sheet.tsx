"use client";

import { useMemo, useState } from "react";
import {
  receiptInputSchema,
  type PublicProduct,
  type PublicWarehouse,
  type ReceiptInput,
} from "@radarstock/contracts";

import { createReceiptAction } from "../_actions";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "@/components/ui/toast";

const selectClassName =
  "h-11 w-full min-w-0 rounded-md border-2 border-input bg-card px-3 py-2 font-mono text-base outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm";

type CreateReceiptFormValues = {
  code: string;
  warehouseId: string;
  supplierName: string;
  receivedAt: string;
  notes: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitCost: number;
  }>;
};

type CreateReceiptSheetProps = {
  products: PublicProduct[];
  warehouses: PublicWarehouse[];
  onClose: () => void;
};

function toDateTimeLocalValue(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function CreateReceiptSheet({
  products,
  warehouses,
  onClose,
}: CreateReceiptSheetProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const defaultProduct = products[0];

  const form = useForm<CreateReceiptFormValues>({
    defaultValues: {
      code: "",
      warehouseId: warehouses[0]?.id ?? "",
      supplierName: "",
      receivedAt: toDateTimeLocalValue(new Date()),
      notes: "",
      items: [
        {
          productId: defaultProduct?.id ?? "",
          quantity: 1,
          unitCost: defaultProduct?.cost ?? 0,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchedItems = useWatch({ control: form.control, name: "items" });

  const previewTotal = useMemo(() => {
    return (watchedItems ?? []).reduce((sum, item) => {
      const quantity = Number(item.quantity) || 0;
      const unitCost = Number(item.unitCost) || 0;
      return sum + quantity * unitCost;
    }, 0);
  }, [watchedItems]);

  function handleProductChange(index: number, productId: string) {
    form.setValue(`items.${index}.productId`, productId);
    const product = products.find((entry) => entry.id === productId);
    if (product) {
      form.setValue(`items.${index}.unitCost`, product.cost);
    }
  }

  async function onSubmit(values: CreateReceiptFormValues) {
    setServerError(null);

    const payload: ReceiptInput = {
      code: values.code.trim(),
      warehouseId: values.warehouseId,
      supplierName:
        values.supplierName.trim() === ""
          ? undefined
          : values.supplierName.trim(),
      receivedAt: new Date(values.receivedAt),
      notes: values.notes.trim() === "" ? undefined : values.notes,
      items: values.items.map((item) => ({
        productId: item.productId,
        quantity: Number(item.quantity),
        unitCost: Number(item.unitCost),
      })),
    };

    const parsed = receiptInputSchema.safeParse(payload);
    if (!parsed.success) {
      setServerError("Dados de recebimento inválidos.");
      return;
    }

    try {
      const result = await createReceiptAction(parsed.data);

      if (!result.ok) {
        setServerError(result.message);
        toast.add({ title: result.message, type: "error" });
        return;
      }

      toast.add({
        title: "Recebimento registrado com sucesso.",
        type: "success",
      });
      onClose();
    } catch {
      const message =
        "Não foi possível conectar ao servidor. Tente novamente.";
      setServerError(message);
      toast.add({ title: message, type: "error" });
    }
  }

  return (
    <Sheet
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Novo recebimento</SheetTitle>
          <SheetDescription>
            Registre uma entrada confirmada com aumento automático de estoque.
          </SheetDescription>
        </SheetHeader>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-1 flex-col"
        >
          <div className="flex-1 space-y-4 overflow-y-auto px-4">
            <FieldGroup>
              <Field data-invalid={!!form.formState.errors.code}>
                <FieldLabel htmlFor="create-receipt-code">Código</FieldLabel>
                <Input
                  id="create-receipt-code"
                  data-testid="create-receipt-code"
                  {...form.register("code", { required: true })}
                />
                {form.formState.errors.code ? (
                  <FieldError errors={[form.formState.errors.code]} />
                ) : null}
              </Field>
              <Field>
                <FieldLabel htmlFor="create-receipt-warehouse">
                  Galpão
                </FieldLabel>
                <select
                  id="create-receipt-warehouse"
                  data-testid="create-receipt-warehouse"
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
                <FieldLabel htmlFor="create-receipt-supplier">
                  Fornecedor
                </FieldLabel>
                <Input
                  id="create-receipt-supplier"
                  data-testid="create-receipt-supplier"
                  {...form.register("supplierName")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="create-receipt-received-at">
                  Data do recebimento
                </FieldLabel>
                <Input
                  id="create-receipt-received-at"
                  data-testid="create-receipt-received-at"
                  type="datetime-local"
                  {...form.register("receivedAt", { required: true })}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="create-receipt-notes">Notas</FieldLabel>
                <Input
                  id="create-receipt-notes"
                  data-testid="create-receipt-notes"
                  {...form.register("notes")}
                />
              </Field>
            </FieldGroup>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold">Itens</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  data-testid="create-receipt-add-item"
                  onClick={() =>
                    append({
                      productId: products[0]?.id ?? "",
                      quantity: 1,
                      unitCost: products[0]?.cost ?? 0,
                    })
                  }
                  disabled={products.length === 0}
                >
                  <PlusIcon data-icon="inline-start" />
                  Adicionar item
                </Button>
              </div>

              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="space-y-3 rounded-md border-2 border-border p-3"
                  data-testid={`create-receipt-item-${index}`}
                >
                  <Field>
                    <FieldLabel
                      htmlFor={`create-receipt-item-product-${index}`}
                    >
                      Produto
                    </FieldLabel>
                    <select
                      id={`create-receipt-item-product-${index}`}
                      data-testid={`create-receipt-item-product-${index}`}
                      className={selectClassName}
                      value={watchedItems?.[index]?.productId ?? ""}
                      onChange={(event) =>
                        handleProductChange(index, event.target.value)
                      }
                    >
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} ({product.sku})
                        </option>
                      ))}
                    </select>
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field>
                      <FieldLabel
                        htmlFor={`create-receipt-item-quantity-${index}`}
                      >
                        Quantidade
                      </FieldLabel>
                      <Input
                        id={`create-receipt-item-quantity-${index}`}
                        data-testid={`create-receipt-item-quantity-${index}`}
                        type="number"
                        min={1}
                        step={1}
                        {...form.register(`items.${index}.quantity`, {
                          required: true,
                          valueAsNumber: true,
                        })}
                      />
                    </Field>
                    <Field>
                      <FieldLabel
                        htmlFor={`create-receipt-item-unit-cost-${index}`}
                      >
                        Custo unitário
                      </FieldLabel>
                      <Input
                        id={`create-receipt-item-unit-cost-${index}`}
                        data-testid={`create-receipt-item-unit-cost-${index}`}
                        type="number"
                        min={0}
                        step="0.01"
                        {...form.register(`items.${index}.unitCost`, {
                          required: true,
                          valueAsNumber: true,
                        })}
                      />
                    </Field>
                  </div>
                  {fields.length > 1 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      data-testid={`create-receipt-item-remove-${index}`}
                      onClick={() => remove(index)}
                    >
                      <Trash2Icon data-icon="inline-start" />
                      Remover item
                    </Button>
                  ) : null}
                </div>
              ))}

              <p className="font-mono text-sm text-muted-foreground">
                Total:{" "}
                {previewTotal.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
            </div>

            {serverError ? (
              <p role="alert" className="text-sm text-destructive">
                {serverError}
              </p>
            ) : null}
          </div>
          <SheetFooter>
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
              disabled={
                form.formState.isSubmitting ||
                products.length === 0 ||
                warehouses.length === 0
              }
              data-testid="create-receipt-save"
            >
              {form.formState.isSubmitting
                ? "Registrando..."
                : "Registrar recebimento"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
