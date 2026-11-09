"use client";

import { useState } from "react";
import {
  updateWarehouseInputSchema,
  type PublicWarehouse,
  type WarehouseStatus,
} from "@radarstock/contracts";
import { useForm } from "react-hook-form";

import { updateWarehouseAction } from "../_actions";

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

const statusOptions: { value: WarehouseStatus; label: string }[] = [
  { value: "active", label: "Ativo" },
  { value: "inactive", label: "Inativo" },
];

const selectClassName =
  "h-11 w-full min-w-0 rounded-md border-2 border-input bg-card px-3 py-2 font-mono text-base outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm";

type EditWarehouseFormValues = {
  name: string;
  code: string;
  address: string;
  capacity: string;
  status: WarehouseStatus;
};

type EditWarehouseSheetProps = {
  warehouse: PublicWarehouse;
  onClose: () => void;
};

export function EditWarehouseSheet({
  warehouse,
  onClose,
}: EditWarehouseSheetProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<EditWarehouseFormValues>({
    defaultValues: {
      name: warehouse.name,
      code: warehouse.code,
      address: warehouse.address ?? "",
      capacity:
        warehouse.capacity === null || warehouse.capacity === undefined
          ? ""
          : String(warehouse.capacity),
      status: warehouse.status,
    },
  });

  async function onSubmit(values: EditWarehouseFormValues) {
    setServerError(null);

    const capacityTrimmed = values.capacity.trim();
    const payload = {
      name: values.name,
      code: values.code,
      address: values.address.trim() === "" ? undefined : values.address,
      capacity:
        capacityTrimmed === "" ? null : Number(capacityTrimmed),
      status: values.status,
    };

    const parsed = updateWarehouseInputSchema.safeParse(payload);
    if (!parsed.success) {
      setServerError("Dados de atualização inválidos.");
      return;
    }

    try {
      const result = await updateWarehouseAction(warehouse.id, parsed.data);

      if (!result.ok) {
        setServerError(result.message);
        toast.add({ title: result.message, type: "error" });
        return;
      }

      toast.add({
        title: "Galpão atualizado com sucesso.",
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
          <SheetTitle>Alterar galpão</SheetTitle>
          <SheetDescription>
            Atualize os dados deste local de armazenagem.
          </SheetDescription>
        </SheetHeader>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-1 flex-col"
        >
          <div className="flex-1 space-y-4 px-4">
            <FieldGroup>
              <Field data-invalid={!!form.formState.errors.name}>
                <FieldLabel htmlFor="edit-warehouse-name">Nome</FieldLabel>
                <Input
                  id="edit-warehouse-name"
                  data-testid="edit-warehouse-name"
                  {...form.register("name", { required: true })}
                />
                {form.formState.errors.name ? (
                  <FieldError errors={[form.formState.errors.name]} />
                ) : null}
              </Field>
              <Field data-invalid={!!form.formState.errors.code}>
                <FieldLabel htmlFor="edit-warehouse-code">Código</FieldLabel>
                <Input
                  id="edit-warehouse-code"
                  data-testid="edit-warehouse-code"
                  {...form.register("code", { required: true })}
                />
                {form.formState.errors.code ? (
                  <FieldError errors={[form.formState.errors.code]} />
                ) : null}
              </Field>
              <Field>
                <FieldLabel htmlFor="edit-warehouse-address">
                  Endereço
                </FieldLabel>
                <Input
                  id="edit-warehouse-address"
                  data-testid="edit-warehouse-address"
                  {...form.register("address")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="edit-warehouse-capacity">
                  Capacidade
                </FieldLabel>
                <Input
                  id="edit-warehouse-capacity"
                  data-testid="edit-warehouse-capacity"
                  type="number"
                  min={1}
                  {...form.register("capacity")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="edit-warehouse-status">Status</FieldLabel>
                <select
                  id="edit-warehouse-status"
                  data-testid="edit-warehouse-status"
                  className={selectClassName}
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
              data-testid="edit-warehouse-save"
            >
              {form.formState.isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
