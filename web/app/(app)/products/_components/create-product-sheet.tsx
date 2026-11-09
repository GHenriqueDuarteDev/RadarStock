"use client";

import { useState } from "react";
import {
  productInputSchema,
  type ProductInput,
  type PublicCategory,
  type ProductStatus,
} from "@radarstock/contracts";
import { useForm } from "react-hook-form";

import { createProductAction } from "../_actions";

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

type CreateProductFormValues = {
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

type CreateProductSheetProps = {
  categories: PublicCategory[];
  onClose: () => void;
};

export function CreateProductSheet({
  categories,
  onClose,
}: CreateProductSheetProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<CreateProductFormValues>({
    defaultValues: {
      name: "",
      sku: "",
      barcode: "",
      description: "",
      categoryId: categories[0]?.id ?? "",
      cost: 0,
      salePrice: 0,
      minStock: 0,
      status: "active",
    },
  });

  async function onSubmit(values: CreateProductFormValues) {
    setServerError(null);

    const payload: ProductInput = {
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

    const parsed = productInputSchema.safeParse(payload);
    if (!parsed.success) {
      setServerError("Dados de produto inválidos.");
      return;
    }

    try {
      const result = await createProductAction(parsed.data);

      if (!result.ok) {
        setServerError(result.message);
        toast.add({ title: result.message, type: "error" });
        return;
      }

      toast.add({ title: "Produto criado com sucesso.", type: "success" });
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
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Novo produto</SheetTitle>
          <SheetDescription>
            Cadastre um produto no catálogo com categoria, preços e status.
          </SheetDescription>
        </SheetHeader>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-1 flex-col"
        >
          <div className="flex-1 space-y-4 overflow-y-auto px-4">
            <FieldGroup>
              <Field data-invalid={!!form.formState.errors.name}>
                <FieldLabel htmlFor="create-product-name">Nome</FieldLabel>
                <Input
                  id="create-product-name"
                  data-testid="create-product-name"
                  {...form.register("name", { required: true })}
                />
                {form.formState.errors.name ? (
                  <FieldError errors={[form.formState.errors.name]} />
                ) : null}
              </Field>
              <Field data-invalid={!!form.formState.errors.sku}>
                <FieldLabel htmlFor="create-product-sku">SKU</FieldLabel>
                <Input
                  id="create-product-sku"
                  data-testid="create-product-sku"
                  {...form.register("sku", { required: true })}
                />
                {form.formState.errors.sku ? (
                  <FieldError errors={[form.formState.errors.sku]} />
                ) : null}
              </Field>
              <Field>
                <FieldLabel htmlFor="create-product-barcode">
                  Código de barras
                </FieldLabel>
                <Input
                  id="create-product-barcode"
                  data-testid="create-product-barcode"
                  {...form.register("barcode")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="create-product-description">
                  Descrição
                </FieldLabel>
                <Input
                  id="create-product-description"
                  data-testid="create-product-description"
                  {...form.register("description")}
                />
              </Field>
              <Field data-invalid={!!form.formState.errors.categoryId}>
                <FieldLabel htmlFor="create-product-category">
                  Categoria
                </FieldLabel>
                <select
                  id="create-product-category"
                  className={selectClassName}
                  data-testid="create-product-category"
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
                <FieldLabel htmlFor="create-product-cost">Custo</FieldLabel>
                <Input
                  id="create-product-cost"
                  type="number"
                  step="0.01"
                  min="0"
                  data-testid="create-product-cost"
                  {...form.register("cost", { valueAsNumber: true })}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="create-product-sale-price">
                  Preço de venda
                </FieldLabel>
                <Input
                  id="create-product-sale-price"
                  type="number"
                  step="0.01"
                  min="0"
                  data-testid="create-product-sale-price"
                  {...form.register("salePrice", { valueAsNumber: true })}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="create-product-min-stock">
                  Estoque mínimo
                </FieldLabel>
                <Input
                  id="create-product-min-stock"
                  type="number"
                  min="0"
                  step="1"
                  data-testid="create-product-min-stock"
                  {...form.register("minStock", { valueAsNumber: true })}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="create-product-status">Status</FieldLabel>
                <select
                  id="create-product-status"
                  className={selectClassName}
                  data-testid="create-product-status"
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
              disabled={form.formState.isSubmitting || categories.length === 0}
              data-testid="create-product-save"
            >
              {form.formState.isSubmitting ? "Criando..." : "Criar produto"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
