"use client";

import type { PublicProduct, PublicWarehouse } from "@radarstock/contracts";
import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useOpenCreateQuery } from "@/hooks/use-open-create-query";

import { CreateSaleSheet } from "./create-sale-sheet";

type NewSaleButtonProps = {
  products: PublicProduct[];
  warehouses: PublicWarehouse[];
};

export function NewSaleButton({ products, warehouses }: NewSaleButtonProps) {
  const { open, setOpen, close } = useOpenCreateQuery();

  return (
    <>
      <Button
        type="button"
        data-testid="new-sale"
        onClick={() => setOpen(true)}
      >
        <PlusIcon data-icon="inline-start" />
        Nova venda
      </Button>
      {open ? (
        <CreateSaleSheet
          products={products}
          warehouses={warehouses}
          onClose={close}
        />
      ) : null}
    </>
  );
}
