"use client";

import { MoreHorizontalIcon } from "lucide-react";
import type { PublicCategory } from "@radarstock/contracts";

import { ListPanel } from "@/components/list-panel";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { displayValue } from "@/lib/utils";

type CategoriesTableProps = {
  data?: PublicCategory[];
  onEdit?: (category: PublicCategory) => void;
  onDelete?: (category: PublicCategory) => void;
};

export function CategoriesTable({
  data = [],
  onEdit,
  onDelete,
}: CategoriesTableProps) {
  return (
    <ListPanel title="Categorias" totalCount={data.length}>
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
            {data.length === 0 ? (
              <tr className="border-t-2 border-border">
                <td className="px-4 py-3 font-semibold">
                  {displayValue(null)}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {displayValue(null)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Ações da categoria"
                    disabled
                  >
                    <MoreHorizontalIcon />
                  </Button>
                </td>
              </tr>
            ) : (
              data.map((category) => (
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
    </ListPanel>
  );
}
