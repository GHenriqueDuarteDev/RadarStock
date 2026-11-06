import { FilterIcon, SearchIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type ListPanelProps = {
  title: string;
  totalCount: number;
  children: ReactNode;
  searchPlaceholder?: string;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onSearchSubmit?: () => void;
};

export function ListPanel({
  title,
  totalCount,
  children,
  searchPlaceholder = "Buscar...",
  page = 1,
  pageSize = 10,
  onPageChange,
  searchValue,
  onSearchChange,
  onSearchSubmit,
}: ListPanelProps) {
  const from = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalCount);
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const searchEnabled =
    searchValue !== undefined &&
    onSearchChange !== undefined &&
    onSearchSubmit !== undefined;
  const canGoPrevious = onPageChange !== undefined && page > 1;
  const canGoNext = onPageChange !== undefined && page < totalPages;

  return (
    <Card className="gap-0 p-0">
      <CardHeader className="border-b-2 py-3 border-border [.border-b]:pb-(--card-spacing)">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {totalCount} registros encontrados
            </p>
          </div>
          <div className="flex items-center gap-2">
            <form
              className="relative min-w-0 flex-1 sm:w-48 sm:flex-none"
              onSubmit={(event) => {
                event.preventDefault();
                onSearchSubmit?.();
              }}
            >
              <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder={searchPlaceholder}
                className="h-8 pl-8"
                aria-label={searchPlaceholder}
                disabled={!searchEnabled}
                value={searchEnabled ? searchValue : ""}
                onChange={
                  searchEnabled
                    ? (event) => onSearchChange(event.target.value)
                    : undefined
                }
                data-testid="list-panel-search"
              />
            </form>
            <Button type="button" variant="outline" size="default" disabled>
              <FilterIcon data-icon="inline-start" />
              Filtrar
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-0">{children}</CardContent>

      <CardFooter className="justify-between gap-2">
        <p className="font-mono text-xs text-muted-foreground">
          Mostrando {from}-{to} de {totalCount}
        </p>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!canGoPrevious}
            onClick={() => onPageChange?.(page - 1)}
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
            disabled={!canGoNext}
            onClick={() => onPageChange?.(page + 1)}
            data-testid="list-panel-next"
          >
            Próximo
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
