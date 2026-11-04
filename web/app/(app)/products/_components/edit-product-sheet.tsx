"use client";

import { useState } from "react";
import {
  publicProductSchema,
  updateProductInputSchema,
  type PublicCategory,
  type PublicProduct,
  type ProductStatus,
} from "@radarstock/contracts";
import { useForm } from "react-hook-form";

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

const statusOptions: { value: ProductStatus; label: string }[] = [
  { value: "active", label: "Ativo" },
  { value: "inactive", label: "Inativo" },
];

const selectClassName =
  "h-11 w-full min-w-0 rounded-md border-2 border-input bg-card px-3 py-2 font-mono text-base outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm";

type EditProductFormValues = {
  name: string;
  sku: string;
  barcode: string;
  description: string;
  categoryId: string;
  cost: number;
  salePrice: number;
  minStock: number;
  status: ProductStatus;
};

type EditProductSheetProps = {
  product: PublicProduct;
  categories: PublicCategory[];
  onClose: () => void;
  onSaved: (product: PublicProduct) => void;
};

export function EditProductSheet({
  product,
  categories,
  onClose,
  onSaved,
}: EditProductSheetProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<EditProductFormValues>({
    defaultValues: {
      name: product.name,
      sku: product.sku,
      barcode: product.barcode ?? "",
      description: product.description ?? "",
      categoryId: product.categoryId,
      cost: product.cost,
      salePrice: product.salePrice,
      minStock: product.minStock,
      status: product.status,
    },
  });

  async function onSubmit(values: EditProductFormValues) {
    setServerError(null);

    const payload = {
      name: values.name,
      sku: values.sku,
      barcode: values.barcode.trim() === "" ? null : values.barcode,
      description:
        values.description.trim() === "" ? undefined : values.description,
      categoryId: values.categoryId,
      cost: Number(values.cost),
      salePrice: Number(values.salePrice),
      minStock: Number(values.minStock),
      status: values.status,
    };

    const parsed = updateProductInputSchema.safeParse(payload);
    if (!parsed.success) {
      setServerError("Dados de atualização inválidos.");
      return;
    }

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const data = await response.json();

      if (!response.ok) {
        const message = data.message ?? "Falha ao atualizar produto.";
        setServerError(message);
        toast.add({ title: message, type: "error" });
        return;
      }

      const updated = publicProductSchema.parse(data);
      toast.add({ title: "Produto atualizado com sucesso.", type: "success" });
      onSaved(updated);
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
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Alterar produto</SheetTitle>
          <SheetDescription>
            Atualize os dados do produto no catálogo.
          </SheetDescription>
        </SheetHeader>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-1 flex-col"
        >
          <div className="flex-1 space-y-4 overflow-y-auto px-4">
            <FieldGroup>
              <Field data-invalid={!!form.formState.errors.name}>
                <FieldLabel htmlFor="edit-product-name">Nome</FieldLabel>
                <Input
                  id="edit-product-name"
                  data-testid="edit-product-name"
                  {...form.register("name", { required: true })}
                />
                {form.formState.errors.name ? (
                  <FieldError errors={[form.formState.errors.name]} />
                ) : null}
              </Field>
              <Field data-invalid={!!form.formState.errors.sku}>
                <FieldLabel htmlFor="edit-product-sku">SKU</FieldLabel>
                <Input
                  id="edit-product-sku"
                  data-testid="edit-product-sku"
                  {...form.register("sku", { required: true })}
                />
                {form.formState.errors.sku ? (
                  <FieldError errors={[form.formState.errors.sku]} />
                ) : null}
              </Field>
              <Field>
                <FieldLabel htmlFor="edit-product-barcode">
                  Código de barras
                </FieldLabel>
                <Input
                  id="edit-product-barcode"
                  data-testid="edit-product-barcode"
                  {...form.register("barcode")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="edit-product-description">
                  Descrição
                </FieldLabel>
                <Input
                  id="edit-product-description"
                  data-testid="edit-product-description"
                  {...form.register("description")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="edit-product-category">
                  Categoria
                </FieldLabel>
                <select
                  id="edit-product-category"
                  className={selectClassName}
                  data-testid="edit-product-category"
                  {...form.register("categoryId", { required: true })}
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field>
                <FieldLabel htmlFor="edit-product-cost">Custo</FieldLabel>
                <Input
                  id="edit-product-cost"
                  type="number"
                  step="0.01"
                  min="0"
                  data-testid="edit-product-cost"
                  {...form.register("cost", { valueAsNumber: true })}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="edit-product-sale-price">
                  Preço de venda
                </FieldLabel>
                <Input
                  id="edit-product-sale-price"
                  type="number"
                  step="0.01"
                  min="0"
                  data-testid="edit-product-sale-price"
                  {...form.register("salePrice", { valueAsNumber: true })}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="edit-product-min-stock">
                  Estoque mínimo
                </FieldLabel>
                <Input
                  id="edit-product-min-stock"
                  type="number"
                  min="0"
                  step="1"
                  data-testid="edit-product-min-stock"
                  {...form.register("minStock", { valueAsNumber: true })}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="edit-product-status">Status</FieldLabel>
                <select
                  id="edit-product-status"
                  className={selectClassName}
                  data-testid="edit-product-status"
                  {...form.register("status")}
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
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
              disabled={form.formState.isSubmitting}
              data-testid="edit-product-save"
            >
              {form.formState.isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
