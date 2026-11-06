"use client";

import type { PublicProduct, PublicWarehouse } from "@radarstock/contracts";
import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useOpenCreateQuery } from "@/hooks/use-open-create-query";

import { CreateMovementSheet } from "./create-movement-sheet";

type NewMovementButtonProps = {
  products: PublicProduct[];
  warehouses: PublicWarehouse[];
};

export function NewMovementButton({
  products,
  warehouses,
}: NewMovementButtonProps) {
  const { open, setOpen, close } = useOpenCreateQuery();

  return (
    <>
      <Button
        type="button"
        data-testid="new-movement"
        onClick={() => setOpen(true)}
      >
        <PlusIcon data-icon="inline-start" />
        Nova movimentação
      </Button>
      {open ? (
        <CreateMovementSheet
          products={products}
          warehouses={warehouses}
          onClose={close}
        />
      ) : null}
    </>
  );
}
