"use client";

import { useCallback, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const CREATE_PARAM = "new";
const CREATE_VALUE = "1";

export function useOpenCreateQuery() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const fromQuery = searchParams.get(CREATE_PARAM) === CREATE_VALUE;
  const [open, setOpen] = useState(fromQuery);
  const [prevFromQuery, setPrevFromQuery] = useState(fromQuery);

  if (fromQuery !== prevFromQuery) {
    setPrevFromQuery(fromQuery);
    if (fromQuery) {
      setOpen(true);
    }
  }

  const clearCreateParam = useCallback(() => {
    if (searchParams.get(CREATE_PARAM) !== CREATE_VALUE) {
      return;
    }
    const next = new URLSearchParams(searchParams.toString());
    next.delete(CREATE_PARAM);
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  const close = useCallback(() => {
    setOpen(false);
    clearCreateParam();
  }, [clearCreateParam]);

  return { open, setOpen, close };
}
