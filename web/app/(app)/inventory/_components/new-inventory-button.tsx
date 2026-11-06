"use client";

import { useState } from "react";
import type {
  PublicInventoryCount,
  PublicWarehouse,
} from "@radarstock/contracts";
import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useOpenCreateQuery } from "@/hooks/use-open-create-query";

import { CreateInventoryDialog } from "./create-inventory-dialog";
import { EditInventoryDialog } from "./edit-inventory-dialog";

type NewInventoryButtonProps = {
  warehouses: PublicWarehouse[];
};

export function NewInventoryButton({ warehouses }: NewInventoryButtonProps) {
  const { open, setOpen, close } = useOpenCreateQuery();
  const [created, setCreated] = useState<PublicInventoryCount | null>(null);

  return (
    <>
      <Button
        type="button"
        data-testid="new-inventory"
        onClick={() => setOpen(true)}
      >
        <PlusIcon data-icon="inline-start" />
        Novo inventário
      </Button>
      {open ? (
        <CreateInventoryDialog
          warehouses={warehouses}
          onClose={close}
          onCreated={(inventory) => {
            close();
            setCreated(inventory);
          }}
        />
      ) : null}
      {created ? (
        <EditInventoryDialog
          key={created.id}
          inventory={created}
          onClose={() => setCreated(null)}
        />
      ) : null}
    </>
  );
}
