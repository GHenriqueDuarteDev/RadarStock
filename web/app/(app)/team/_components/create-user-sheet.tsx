"use client";

import { useState } from "react";
import {
  adminCreateUserSchema,
  publicUserRecordSchema,
  type AdminCreateUser,
  type PublicUserRecord,
  type UserRole,
} from "@radarstock/contracts";
import { zodResolver } from "@hookform/resolvers/zod";
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

const roleOptions: { value: UserRole; label: string }[] = [
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Gerente" },
  { value: "operator", label: "Operador" },
  { value: "viewer", label: "Visualizador" },
];

const selectClassName =
  "h-11 w-full min-w-0 rounded-md border-2 border-input bg-card px-3 py-2 font-mono text-base outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm";

type CreateUserSheetProps = {
  onClose: () => void;
  onCreated: (user: PublicUserRecord) => void;
};

export function CreateUserSheet({ onClose, onCreated }: CreateUserSheetProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<AdminCreateUser>({
    resolver: zodResolver(adminCreateUserSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "viewer",
    },
  });

  async function onSubmit(values: AdminCreateUser) {
    setServerError(null);

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        const message = data.message ?? "Falha ao criar membro.";
        setServerError(message);
        toast.add({ title: message, type: "error" });
        return;
      }

      const user = publicUserRecordSchema.parse(data);
      toast.add({
        title: "Membro criado com sucesso.",
        type: "success",
      });
      onCreated(user);
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
          <SheetTitle>Novo membro</SheetTitle>
          <SheetDescription>
            Cadastre um membro com e-mail, senha e permissão de acesso.
          </SheetDescription>
        </SheetHeader>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-1 flex-col"
        >
          <div className="flex-1 space-y-4 px-4">
            <FieldGroup>
              <Field data-invalid={!!form.formState.errors.firstName}>
                <FieldLabel htmlFor="create-first-name">Nome</FieldLabel>
                <Input
                  id="create-first-name"
                  data-testid="create-first-name"
                  aria-invalid={!!form.formState.errors.firstName}
                  {...form.register("firstName")}
                />
                {form.formState.errors.firstName ? (
                  <FieldError errors={[form.formState.errors.firstName]} />
                ) : null}
              </Field>
              <Field data-invalid={!!form.formState.errors.lastName}>
                <FieldLabel htmlFor="create-last-name">Sobrenome</FieldLabel>
                <Input
                  id="create-last-name"
                  data-testid="create-last-name"
                  aria-invalid={!!form.formState.errors.lastName}
                  {...form.register("lastName")}
                />
                {form.formState.errors.lastName ? (
                  <FieldError errors={[form.formState.errors.lastName]} />
                ) : null}
              </Field>
              <Field data-invalid={!!form.formState.errors.email}>
                <FieldLabel htmlFor="create-email">E-mail</FieldLabel>
                <Input
                  id="create-email"
                  type="email"
                  data-testid="create-email"
                  aria-invalid={!!form.formState.errors.email}
                  {...form.register("email")}
                />
                {form.formState.errors.email ? (
                  <FieldError errors={[form.formState.errors.email]} />
                ) : null}
              </Field>
              <Field data-invalid={!!form.formState.errors.password}>
                <FieldLabel htmlFor="create-password">Senha</FieldLabel>
                <Input
                  id="create-password"
                  type="password"
                  data-testid="create-password"
                  autoComplete="new-password"
                  aria-invalid={!!form.formState.errors.password}
                  {...form.register("password")}
                />
                {form.formState.errors.password ? (
                  <FieldError errors={[form.formState.errors.password]} />
                ) : null}
              </Field>
              <Field data-invalid={!!form.formState.errors.role}>
                <FieldLabel htmlFor="create-role">Permissão</FieldLabel>
                <select
                  id="create-role"
                  className={selectClassName}
                  data-testid="create-role"
                  aria-invalid={!!form.formState.errors.role}
                  {...form.register("role")}
                >
                  {roleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {form.formState.errors.role ? (
                  <FieldError errors={[form.formState.errors.role]} />
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
              data-testid="create-save"
            >
              {form.formState.isSubmitting ? "Criando..." : "Criar membro"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
