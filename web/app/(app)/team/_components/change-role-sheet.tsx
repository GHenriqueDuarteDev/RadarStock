"use client";

import { useState } from "react";
import {
  publicUserRecordSchema,
  updateUserRoleSchema,
  type PublicUserRecord,
  type UpdateUserRole,
  type UserRole,
} from "@radarstock/contracts";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const roleOptions: { value: UserRole; label: string }[] = [
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Gerente" },
  { value: "operator", label: "Operador" },
  { value: "viewer", label: "Visualizador" },
];

const selectClassName =
  "h-11 w-full min-w-0 rounded-md border-2 border-input bg-card px-3 py-2 font-mono text-base outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm";

type ChangeRoleSheetProps = {
  user: PublicUserRecord;
  onClose: () => void;
  onSaved: (user: PublicUserRecord) => void;
};

export function ChangeRoleSheet({
  user,
  onClose,
  onSaved,
}: ChangeRoleSheetProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<UpdateUserRole>({
    resolver: zodResolver(updateUserRoleSchema),
    defaultValues: {
      role: user.role,
    },
  });

  async function onSubmit(values: UpdateUserRole) {
    setServerError(null);

    try {
      const response = await fetch(`/api/users/${user.id}/role`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        setServerError(data.message ?? "Falha ao alterar permissão.");
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
          <SheetTitle>Alterar permissão</SheetTitle>
          <SheetDescription>
            Defina a permissão de acesso deste membro.
          </SheetDescription>
        </SheetHeader>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-1 flex-col"
        >
          <div className="flex-1 space-y-4 px-4">
            <Field data-invalid={!!form.formState.errors.role}>
              <FieldLabel htmlFor="edit-role">Permissão</FieldLabel>
              <select
                id="edit-role"
                className={selectClassName}
                data-testid="edit-role"
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
              data-testid="role-save"
            >
              {form.formState.isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
