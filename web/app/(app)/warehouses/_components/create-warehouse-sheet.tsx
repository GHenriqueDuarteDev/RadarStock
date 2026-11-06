"use client";

import { useState } from "react";
import {
  publicWarehouseSchema,
  warehouseInputSchema,
  type PublicWarehouse,
  type WarehouseInput,
  type WarehouseStatus,
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

const statusOptions: { value: WarehouseStatus; label: string }[] = [
  { value: "active", label: "Ativo" },
  { value: "inactive", label: "Inativo" },
];

const selectClassName =
  "h-11 w-full min-w-0 rounded-md border-2 border-input bg-card px-3 py-2 font-mono text-base outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm";

type CreateWarehouseFormValues = {
  name: string;
  code: string;
  address: string;
  capacity: string;
  status: WarehouseStatus;
};

type CreateWarehouseSheetProps = {
  onClose: () => void;
  onCreated: (warehouse: PublicWarehouse) => void;
};

export function CreateWarehouseSheet({
  onClose,
  onCreated,
}: CreateWarehouseSheetProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<CreateWarehouseFormValues>({
    defaultValues: {
      name: "",
      code: "",
      address: "",
      capacity: "",
      status: "active",
    },
  });

  async function onSubmit(values: CreateWarehouseFormValues) {
    setServerError(null);

    const capacityTrimmed = values.capacity.trim();
    const payload: WarehouseInput = {
      name: values.name,
      code: values.code,
      address: values.address.trim() === "" ? undefined : values.address,
      capacity:
        capacityTrimmed === "" ? null : Number(capacityTrimmed),
      status: values.status,
    };

    const parsed = warehouseInputSchema.safeParse(payload);
    if (!parsed.success) {
      setServerError("Dados de galpão inválidos.");
      return;
    }

    try {
      const response = await fetch("/api/warehouses", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const data = await response.json();

      if (!response.ok) {
        const message = data.message ?? "Falha ao criar galpão.";
        setServerError(message);
        toast.add({ title: message, type: "error" });
        return;
      }

      const warehouse = publicWarehouseSchema.parse(data);
      toast.add({ title: "Galpão criado com sucesso.", type: "success" });
      onCreated(warehouse);
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
          <SheetTitle>Novo galpão</SheetTitle>
          <SheetDescription>
            Cadastre um local de armazenagem com código e capacidade.
          </SheetDescription>
        </SheetHeader>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-1 flex-col"
        >
          <div className="flex-1 space-y-4 px-4">
            <FieldGroup>
              <Field data-invalid={!!form.formState.errors.name}>
                <FieldLabel htmlFor="create-warehouse-name">Nome</FieldLabel>
                <Input
                  id="create-warehouse-name"
                  data-testid="create-warehouse-name"
                  {...form.register("name", { required: true })}
                />
                {form.formState.errors.name ? (
                  <FieldError errors={[form.formState.errors.name]} />
                ) : null}
              </Field>
              <Field data-invalid={!!form.formState.errors.code}>
                <FieldLabel htmlFor="create-warehouse-code">Código</FieldLabel>
                <Input
                  id="create-warehouse-code"
                  data-testid="create-warehouse-code"
                  {...form.register("code", { required: true })}
                />
                {form.formState.errors.code ? (
                  <FieldError errors={[form.formState.errors.code]} />
                ) : null}
              </Field>
              <Field>
                <FieldLabel htmlFor="create-warehouse-address">
                  Endereço
                </FieldLabel>
                <Input
                  id="create-warehouse-address"
                  data-testid="create-warehouse-address"
                  {...form.register("address")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="create-warehouse-capacity">
                  Capacidade
                </FieldLabel>
                <Input
                  id="create-warehouse-capacity"
                  data-testid="create-warehouse-capacity"
                  type="number"
                  min={1}
                  {...form.register("capacity")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="create-warehouse-status">Status</FieldLabel>
                <select
                  id="create-warehouse-status"
                  data-testid="create-warehouse-status"
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
              data-testid="create-warehouse-save"
            >
              {form.formState.isSubmitting ? "Criando..." : "Criar galpão"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
