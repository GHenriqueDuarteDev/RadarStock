"use client";

import type { PublicProduct, PublicWarehouse } from "@radarstock/contracts";
import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useOpenCreateQuery } from "@/hooks/use-open-create-query";

import { CreateReceiptSheet } from "./create-receipt-sheet";

type NewReceiptButtonProps = {
  products: PublicProduct[];
  warehouses: PublicWarehouse[];
};

export function NewReceiptButton({
  products,
  warehouses,
}: NewReceiptButtonProps) {
  const { open, setOpen, close } = useOpenCreateQuery();

  return (
    <>
      <Button
        type="button"
        data-testid="new-receipt"
        onClick={() => setOpen(true)}
      >
        <PlusIcon data-icon="inline-start" />
        Novo recebimento
      </Button>
      {open ? (
        <CreateReceiptSheet
          products={products}
          warehouses={warehouses}
          onClose={close}
        />
      ) : null}
    </>
  );
}
