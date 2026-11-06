"use client";

import type { PublicCategory } from "@radarstock/contracts";
import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useOpenCreateQuery } from "@/hooks/use-open-create-query";

import { CreateProductSheet } from "./create-product-sheet";

type NewProductButtonProps = {
  categories: PublicCategory[];
};

export function NewProductButton({ categories }: NewProductButtonProps) {
  const { open, setOpen, close } = useOpenCreateQuery();

  return (
    <>
      <Button
        type="button"
        data-testid="new-product"
        onClick={() => setOpen(true)}
      >
        <PlusIcon data-icon="inline-start" />
        Novo produto
      </Button>
      {open ? (
        <CreateProductSheet categories={categories} onClose={close} />
      ) : null}
    </>
  );
}
