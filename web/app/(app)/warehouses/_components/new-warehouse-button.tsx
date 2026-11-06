"use client";

import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useOpenCreateQuery } from "@/hooks/use-open-create-query";

import { CreateWarehouseSheet } from "./create-warehouse-sheet";

export function NewWarehouseButton() {
  const { open, setOpen, close } = useOpenCreateQuery();

  return (
    <>
      <Button
        type="button"
        data-testid="new-warehouse"
        onClick={() => setOpen(true)}
      >
        <PlusIcon data-icon="inline-start" />
        Novo galpão
      </Button>
      {open ? <CreateWarehouseSheet onClose={close} /> : null}
    </>
  );
}
