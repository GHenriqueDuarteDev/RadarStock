"use client";

import { SearchIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "cn";

type ListPanelProps = {
  title: string;
  totalCount: number;
  children: ReactNode;
  page?: number;
  pageSize?: number;
  searchPlaceholder?: string;
  /** Nome do query param de busca. Omitir desabilita a busca. */
  searchParam?: string;
  pageParam?: string;
};

// O estado da lista (página e busca) vive na URL; o painel apenas navega.
export function ListPanel({
  title,
  totalCount,
  children,
  page = 1,
  pageSize = 10,
  searchPlaceholder = "Buscar...",
  searchParam,
  pageParam = "page",
}: ListPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchInput, setSearchInput] = useState(
    searchParam ? (searchParams.get(searchParam) ?? "") : "",
  );

  const from = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalCount);
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const searchEnabled = searchParam !== undefined;

  function navigate(mutate: (params: URLSearchParams) => void) {
    const next = new URLSearchParams(searchParams.toString());
    mutate(next);
    const query = next.toString();
    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    });
  }

  function goToPage(nextPage: number) {
    navigate((params) => {
      if (nextPage <= 1) {
        params.delete(pageParam);
      } else {
        params.set(pageParam, String(nextPage));
      }
    });
  }

  function submitSearch() {
    if (!searchParam) return;
    const value = searchInput.trim();
    navigate((params) => {
      params.delete(pageParam);
      if (value) {
        params.set(searchParam, value);
      } else {
        params.delete(searchParam);
      }
    });
  }

  return (
    <Card className="gap-0 p-0" aria-busy={isPending}>
      <CardHeader className="border-b-2 py-3 border-border [.border-b]:pb-(--card-spacing)">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {totalCount} registros encontrados
            </p>
          </div>
          {searchEnabled ? (
            <form
              className="relative min-w-0 sm:w-48"
              onSubmit={(event) => {
                event.preventDefault();
                submitSearch();
              }}
            >
              <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder={searchPlaceholder}
                className="h-8 pl-8"
                aria-label={searchPlaceholder}
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                data-testid="list-panel-search"
              />
            </form>
          ) : null}
        </div>
      </CardHeader>

      <CardContent
        className={cn(
          "px-0 transition-opacity",
          isPending && "pointer-events-none opacity-60",
        )}
      >
        {children}
      </CardContent>

      <CardFooter className="justify-between gap-2">
        <p className="font-mono text-xs text-muted-foreground">
          Mostrando {from}-{to} de {totalCount}
        </p>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page <= 1 || isPending}
            onClick={() => goToPage(page - 1)}
            data-testid="list-panel-prev"
          >
            Anterior
          </Button>
          <Button type="button" variant="outline" size="sm" disabled>
            {page}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page >= totalPages || isPending}
            onClick={() => goToPage(page + 1)}
            data-testid="list-panel-next"
          >
            Próximo
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
