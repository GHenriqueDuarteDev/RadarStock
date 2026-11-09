"use client";

import { useState } from "react";
import {
  updateCategoryInputSchema,
  type PublicCategory,
} from "@radarstock/contracts";

import { updateCategoryAction } from "../_actions";
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

type EditCategoryFormValues = {
  name: string;
  description: string;
};

type EditCategorySheetProps = {
  category: PublicCategory;
  onClose: () => void;
};

export function EditCategorySheet({
  category,
  onClose,
}: EditCategorySheetProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<EditCategoryFormValues>({
    defaultValues: {
      name: category.name,
      description: category.description ?? "",
    },
  });

  async function onSubmit(values: EditCategoryFormValues) {
    setServerError(null);

    const payload = {
      name: values.name,
      description:
        values.description.trim() === "" ? undefined : values.description,
    };

    const parsed = updateCategoryInputSchema.safeParse(payload);
    if (!parsed.success) {
      setServerError("Dados de atualização inválidos.");
      return;
    }

    try {
      const result = await updateCategoryAction(category.id, parsed.data);

      if (!result.ok) {
        setServerError(result.message);
        toast.add({ title: result.message, type: "error" });
        return;
      }

      toast.add({
        title: "Categoria atualizada com sucesso.",
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
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Alterar categoria</SheetTitle>
          <SheetDescription>
            Atualize o nome ou a descrição desta categoria.
          </SheetDescription>
        </SheetHeader>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-1 flex-col"
        >
          <div className="flex-1 space-y-4 px-4">
            <FieldGroup>
              <Field data-invalid={!!form.formState.errors.name}>
                <FieldLabel htmlFor="edit-category-name">Nome</FieldLabel>
                <Input
                  id="edit-category-name"
                  data-testid="edit-category-name"
                  {...form.register("name", { required: true })}
                />
                {form.formState.errors.name ? (
                  <FieldError errors={[form.formState.errors.name]} />
                ) : null}
              </Field>
              <Field>
                <FieldLabel htmlFor="edit-category-description">
                  Descrição
                </FieldLabel>
                <Input
                  id="edit-category-description"
                  data-testid="edit-category-description"
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
              data-testid="edit-category-save"
            >
              {form.formState.isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
