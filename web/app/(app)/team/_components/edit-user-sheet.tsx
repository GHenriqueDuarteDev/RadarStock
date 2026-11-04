"use client";

import { useState } from "react";
import {
  publicUserRecordSchema,
  type PublicUserRecord,
} from "@radarstock/contracts";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

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

const editUserFormSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.email(),
  password: z.union([z.string().min(8), z.literal("")]),
});

type EditUserFormValues = z.infer<typeof editUserFormSchema>;

type EditUserSheetProps = {
  user: PublicUserRecord;
  onClose: () => void;
  onSaved: (user: PublicUserRecord) => void;
};

export function EditUserSheet({ user, onClose, onSaved }: EditUserSheetProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserFormSchema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: "",
    },
  });

  async function onSubmit(values: EditUserFormValues) {
    setServerError(null);

    const payload = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      ...(values.password !== "" ? { password: values.password } : {}),
    };

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setServerError(data.message ?? "Falha ao atualizar.");
        return;
      }

      onSaved(publicUserRecordSchema.parse(data));
    } catch {
      setServerError("Não foi possível conectar ao servidor. Tente novamente.");
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
          <SheetTitle>Alterar dados</SheetTitle>
          <SheetDescription>
            Atualize nome, e-mail ou senha do membro.
          </SheetDescription>
        </SheetHeader>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-1 flex-col"
        >
          <div className="flex-1 space-y-4 px-4">
            <FieldGroup>
              <Field data-invalid={!!form.formState.errors.firstName}>
                <FieldLabel htmlFor="edit-first-name">Nome</FieldLabel>
                <Input
                  id="edit-first-name"
                  data-testid="edit-first-name"
                  aria-invalid={!!form.formState.errors.firstName}
                  {...form.register("firstName")}
                />
                {form.formState.errors.firstName ? (
                  <FieldError errors={[form.formState.errors.firstName]} />
                ) : null}
              </Field>
              <Field data-invalid={!!form.formState.errors.lastName}>
                <FieldLabel htmlFor="edit-last-name">Sobrenome</FieldLabel>
                <Input
                  id="edit-last-name"
                  data-testid="edit-last-name"
                  aria-invalid={!!form.formState.errors.lastName}
                  {...form.register("lastName")}
                />
                {form.formState.errors.lastName ? (
                  <FieldError errors={[form.formState.errors.lastName]} />
                ) : null}
              </Field>
              <Field data-invalid={!!form.formState.errors.email}>
                <FieldLabel htmlFor="edit-email">E-mail</FieldLabel>
                <Input
                  id="edit-email"
                  type="email"
                  data-testid="edit-email"
                  aria-invalid={!!form.formState.errors.email}
                  {...form.register("email")}
                />
                {form.formState.errors.email ? (
                  <FieldError errors={[form.formState.errors.email]} />
                ) : null}
              </Field>
              <Field data-invalid={!!form.formState.errors.password}>
                <FieldLabel htmlFor="edit-password">
                  Nova senha (opcional)
                </FieldLabel>
                <Input
                  id="edit-password"
                  type="password"
                  data-testid="edit-password"
                  aria-invalid={!!form.formState.errors.password}
                  {...form.register("password")}
                />
                {form.formState.errors.password ? (
                  <FieldError errors={[form.formState.errors.password]} />
                ) : null}
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
              data-testid="edit-save"
            >
              {form.formState.isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
