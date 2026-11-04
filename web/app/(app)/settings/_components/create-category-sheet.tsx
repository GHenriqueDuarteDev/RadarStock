"use client";

import { useState } from "react";
import {
  categoryInputSchema,
  publicCategorySchema,
  type CategoryInput,
  type PublicCategory,
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

type CreateCategoryFormValues = {
  name: string;
  description: string;
};

type CreateCategorySheetProps = {
  onClose: () => void;
  onCreated: (category: PublicCategory) => void;
};

export function CreateCategorySheet({
  onClose,
  onCreated,
}: CreateCategorySheetProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<CreateCategoryFormValues>({
    defaultValues: {
      name: "",
      description: "",
    },
  });

  async function onSubmit(values: CreateCategoryFormValues) {
    setServerError(null);

    const payload: CategoryInput = {
      name: values.name,
      description:
        values.description.trim() === "" ? undefined : values.description,
    };

    const parsed = categoryInputSchema.safeParse(payload);
    if (!parsed.success) {
      setServerError("Dados de categoria inválidos.");
      return;
    }

    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const data = await response.json();

      if (!response.ok) {
        const message = data.message ?? "Falha ao criar categoria.";
        setServerError(message);
        toast.add({ title: message, type: "error" });
        return;
      }

      const category = publicCategorySchema.parse(data);
      toast.add({ title: "Categoria criada com sucesso.", type: "success" });
      onCreated(category);
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
          <SheetTitle>Nova categoria</SheetTitle>
          <SheetDescription>
            Cadastre uma categoria para organizar o catálogo de produtos.
          </SheetDescription>
        </SheetHeader>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-1 flex-col"
        >
          <div className="flex-1 space-y-4 px-4">
            <FieldGroup>
              <Field data-invalid={!!form.formState.errors.name}>
                <FieldLabel htmlFor="create-category-name">Nome</FieldLabel>
                <Input
                  id="create-category-name"
                  data-testid="create-category-name"
                  {...form.register("name", { required: true })}
                />
                {form.formState.errors.name ? (
                  <FieldError errors={[form.formState.errors.name]} />
                ) : null}
              </Field>
              <Field>
                <FieldLabel htmlFor="create-category-description">
                  Descrição
                </FieldLabel>
                <Input
                  id="create-category-description"
                  data-testid="create-category-description"
                  {...form.register("description")}
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
              disabled={form.formState.isSubmitting}
              data-testid="create-category-save"
            >
              {form.formState.isSubmitting ? "Criando..." : "Criar categoria"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
