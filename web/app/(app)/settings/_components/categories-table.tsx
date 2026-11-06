"use client";

import { useMemo, useState } from "react";
import { MoreHorizontalIcon, PlusIcon, SearchIcon } from "lucide-react";
import type { PublicCategory } from "@radarstock/contracts";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { displayValue } from "@/lib/utils";

type CategoriesTableProps = {
  data?: PublicCategory[];
  onCreate: () => void;
  onEdit?: (category: PublicCategory) => void;
  onDelete?: (category: PublicCategory) => void;
};

export function CategoriesTable({
  data = [],
  onCreate,
  onEdit,
  onDelete,
}: CategoriesTableProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (query === "") {
      return data;
    }
    return data.filter((category) => {
      const name = category.name.toLowerCase();
      const description = (category.description ?? "").toLowerCase();
      return name.includes(query) || description.includes(query);
    });
  }, [data, search]);

  const countLabel = filtered.length === 1 ? "categoria" : "categorias";
  const countText =
    search.trim() !== ""
      ? `${filtered.length} ${countLabel} de ${data.length}`
      : `${filtered.length} ${countLabel}`;

  return (
    <Card
      className="w-fit h-fit gap-0 p-0"
      data-testid="categories-settings-card"
    >
      <CardHeader className="border-b-2 border-border py-3 [.border-b]:pb-(--card-spacing)">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Categorias</CardTitle>
            <CardDescription>{countText}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative min-w-0 flex-1 sm:w-48 sm:flex-none">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar categoria..."
                className="h-8 pl-8"
                aria-label="Buscar categoria"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                data-testid="categories-search"
              />
            </div>
            <Button type="button" data-testid="new-category" onClick={onCreate}>
              <PlusIcon data-icon="inline-start" />
              Nova categoria
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-0 py-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted text-foreground">
              <tr>
                <th className="px-4 py-2 text-center font-mono text-xs font-semibold tracking-wide uppercase">
                  Nome
                </th>
                <th className="px-4 py-2 text-center font-mono text-xs font-semibold tracking-wide uppercase">
                  Descrição
                </th>
                <th className="px-4 py-2 text-center text-xs font-semibold tracking-wide uppercase">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr className="border-t-2 border-border">
                  <td
                    colSpan={3}
                    className="px-4 py-6 text-center text-sm text-muted-foreground"
                  >
                    {data.length === 0
                      ? "Nenhuma categoria cadastrada."
                      : "Nenhuma categoria encontrada para a busca."}
                  </td>
                </tr>
              ) : (
                filtered.map((category) => (
                  <tr key={category.id} className="border-t-2 border-border">
                    <td className="px-4 py-3 font-semibold">
                      {displayValue(category.name)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {displayValue(category.description)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          data-testid={`category-actions-${category.id}`}
                          aria-label={`Ações de ${category.name}`}
                          className="inline-flex size-7 items-center justify-center rounded-md hover:bg-muted"
                        >
                          <MoreHorizontalIcon className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-44">
                          <DropdownMenuItem
                            onClick={() => onEdit?.(category)}
                            data-testid={`category-edit-${category.id}`}
                          >
                            Alterar dados
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => onDelete?.(category)}
                            data-testid={`category-delete-${category.id}`}
                          >
                            Excluir categoria
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>

      <CardFooter className="justify-between gap-2">
        <p className="font-mono text-xs text-muted-foreground">
          Mostrando {filtered.length} de {data.length}
        </p>
      </CardFooter>
    </Card>
  );
}
