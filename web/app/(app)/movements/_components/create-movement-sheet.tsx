"use client";

import { useEffect, useState } from "react";
import {
  publicStockMovementSchema,
  stockMovementInputSchema,
  type PublicProduct,
  type PublicStockMovement,
  type PublicWarehouse,
  type StockMovementInput,
  type StockMovementType,
} from "@radarstock/contracts";
import { useForm, useWatch } from "react-hook-form";

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

const typeOptions: { value: StockMovementType; label: string }[] = [
  { value: "in", label: "Entrada" },
  { value: "out", label: "Saída" },
  { value: "transfer", label: "Transferência" },
  { value: "adjustment", label: "Ajuste" },
];

const selectClassName =
  "h-11 w-full min-w-0 rounded-md border-2 border-input bg-card px-3 py-2 font-mono text-base outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm";

type CreateMovementFormValues = {
  type: StockMovementType;
  productId: string;
  quantity: number;
  fromWarehouseId: string;
  toWarehouseId: string;
  adjustmentDirection: "increase" | "decrease";
  note: string;
};

type CreateMovementSheetProps = {
  products: PublicProduct[];
  warehouses: PublicWarehouse[];
  onClose: () => void;
  onCreated: (movement: PublicStockMovement) => void;
};

export function CreateMovementSheet({
  products,
  warehouses,
  onClose,
  onCreated,
}: CreateMovementSheetProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<CreateMovementFormValues>({
    defaultValues: {
      type: "in",
      productId: products[0]?.id ?? "",
      quantity: 1,
      fromWarehouseId: warehouses[0]?.id ?? "",
      toWarehouseId: warehouses[0]?.id ?? "",
      adjustmentDirection: "increase",
      note: "",
    },
  });

  const selectedType = useWatch({ control: form.control, name: "type" });

  useEffect(() => {
    form.setValue("fromWarehouseId", warehouses[0]?.id ?? "");
    form.setValue("toWarehouseId", warehouses[0]?.id ?? "");
  }, [form, selectedType, warehouses]);

  async function onSubmit(values: CreateMovementFormValues) {
    setServerError(null);

    let payload: StockMovementInput;

    if (values.type === "in") {
      payload = {
        type: "in",
        productId: values.productId,
        quantity: values.quantity,
        fromWarehouseId: null,
        toWarehouseId: values.toWarehouseId,
        note: values.note.trim() === "" ? undefined : values.note,
        referenceType: "manual",
        referenceId: null,
      };
    } else if (values.type === "out") {
      payload = {
        type: "out",
        productId: values.productId,
        quantity: values.quantity,
        fromWarehouseId: values.fromWarehouseId,
        toWarehouseId: null,
        note: values.note.trim() === "" ? undefined : values.note,
        referenceType: "manual",
        referenceId: null,
      };
    } else if (values.type === "transfer") {
      payload = {
        type: "transfer",
        productId: values.productId,
        quantity: values.quantity,
        fromWarehouseId: values.fromWarehouseId,
        toWarehouseId: values.toWarehouseId,
        note: values.note.trim() === "" ? undefined : values.note,
        referenceType: "manual",
        referenceId: null,
      };
    } else if (values.adjustmentDirection === "increase") {
      payload = {
        type: "adjustment",
        productId: values.productId,
        quantity: values.quantity,
        fromWarehouseId: null,
        toWarehouseId: values.toWarehouseId,
        note: values.note.trim() === "" ? undefined : values.note,
        referenceType: "manual",
        referenceId: null,
      };
    } else {
      payload = {
        type: "adjustment",
        productId: values.productId,
        quantity: values.quantity,
        fromWarehouseId: values.fromWarehouseId,
        toWarehouseId: null,
        note: values.note.trim() === "" ? undefined : values.note,
        referenceType: "manual",
        referenceId: null,
      };
    }

    const parsed = stockMovementInputSchema.safeParse(payload);
    if (!parsed.success) {
      setServerError("Dados de movimentação inválidos.");
      return;
    }

    try {
      const response = await fetch("/api/movements", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const data = await response.json();

      if (!response.ok) {
        const message = data.message ?? "Falha ao criar movimentação.";
        setServerError(message);
        toast.add({ title: message, type: "error" });
        return;
      }

      const movement = publicStockMovementSchema.parse(data);
      toast.add({
        title: "Movimentação registrada com sucesso.",
        type: "success",
      });
      onCreated(movement);
    } catch {
      const message =
        "Não foi possível conectar ao servidor. Tente novamente.";
      setServerError(message);
      toast.add({ title: message, type: "error" });
    }
  }

  const showFrom =
    selectedType === "out" ||
    selectedType === "transfer" ||
    (selectedType === "adjustment" &&
      form.watch("adjustmentDirection") === "decrease");
  const showTo =
    selectedType === "in" ||
    selectedType === "transfer" ||
    (selectedType === "adjustment" &&
      form.watch("adjustmentDirection") === "increase");

  return (
    <Sheet
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Nova movimentação</SheetTitle>
          <SheetDescription>
            Registre uma entrada, saída, transferência ou ajuste de estoque.
          </SheetDescription>
        </SheetHeader>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-1 flex-col"
        >
          <div className="flex-1 space-y-4 px-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="create-movement-type">Tipo</FieldLabel>
                <select
                  id="create-movement-type"
                  data-testid="create-movement-type"
                  className={selectClassName}
                  {...form.register("type")}
                >
                  {typeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field data-invalid={!!form.formState.errors.productId}>
                <FieldLabel htmlFor="create-movement-product">
                  Produto
                </FieldLabel>
                <select
                  id="create-movement-product"
                  data-testid="create-movement-product"
                  className={selectClassName}
                  {...form.register("productId", { required: true })}
                >
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.sku})
                    </option>
                  ))}
                </select>
                {form.formState.errors.productId ? (
                  <FieldError errors={[form.formState.errors.productId]} />
                ) : null}
              </Field>
              <Field data-invalid={!!form.formState.errors.quantity}>
                <FieldLabel htmlFor="create-movement-quantity">
                  Quantidade
                </FieldLabel>
                <Input
                  id="create-movement-quantity"
                  data-testid="create-movement-quantity"
                  type="number"
                  min={1}
                  step={1}
                  {...form.register("quantity", {
                    required: true,
                    valueAsNumber: true,
                  })}
                />
                {form.formState.errors.quantity ? (
                  <FieldError errors={[form.formState.errors.quantity]} />
                ) : null}
              </Field>
              {selectedType === "adjustment" ? (
                <Field>
                  <FieldLabel htmlFor="create-movement-adjustment-direction">
                    Direção do ajuste
                  </FieldLabel>
                  <select
                    id="create-movement-adjustment-direction"
                    data-testid="create-movement-adjustment-direction"
                    className={selectClassName}
                    {...form.register("adjustmentDirection")}
                  >
                    <option value="increase">Entrada (aumentar saldo)</option>
                    <option value="decrease">Baixa (diminuir saldo)</option>
                  </select>
                </Field>
              ) : null}
              {showFrom ? (
                <Field>
                  <FieldLabel htmlFor="create-movement-from">
                    Galpão de origem
                  </FieldLabel>
                  <select
                    id="create-movement-from"
                    data-testid="create-movement-from"
                    className={selectClassName}
                    {...form.register("fromWarehouseId", { required: true })}
                  >
                    {warehouses.map((warehouse) => (
                      <option key={warehouse.id} value={warehouse.id}>
                        {warehouse.name} ({warehouse.code})
                      </option>
                    ))}
                  </select>
                </Field>
              ) : null}
              {showTo ? (
                <Field>
                  <FieldLabel htmlFor="create-movement-to">
                    Galpão de destino
                  </FieldLabel>
                  <select
                    id="create-movement-to"
                    data-testid="create-movement-to"
                    className={selectClassName}
                    {...form.register("toWarehouseId", { required: true })}
                  >
                    {warehouses.map((warehouse) => (
                      <option key={warehouse.id} value={warehouse.id}>
                        {warehouse.name} ({warehouse.code})
                      </option>
                    ))}
                  </select>
                </Field>
              ) : null}
              <Field>
                <FieldLabel htmlFor="create-movement-note">Nota</FieldLabel>
                <Input
                  id="create-movement-note"
                  data-testid="create-movement-note"
                  {...form.register("note")}
                />
              </Field>
            </FieldGroup>
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
              data-testid="create-movement-save"
            >
              {form.formState.isSubmitting
                ? "Registrando..."
                : "Registrar movimentação"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
