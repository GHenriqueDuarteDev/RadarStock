"use client";

import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useOpenCreateQuery } from "@/hooks/use-open-create-query";

import { CreateUserSheet } from "./create-user-sheet";

export function NewMemberButton() {
  const { open, setOpen, close } = useOpenCreateQuery();

  return (
    <>
      <Button
        type="button"
        data-testid="new-member"
        onClick={() => setOpen(true)}
      >
        <PlusIcon data-icon="inline-start" />
        Novo membro
      </Button>
      {open ? <CreateUserSheet onClose={close} /> : null}
    </>
  );
}
