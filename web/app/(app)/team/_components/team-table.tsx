"use client";

import { MoreHorizontalIcon } from "lucide-react";
import type {
  PublicUserRecord,
  UserRole,
  UserStatus,
} from "@radarstock/contracts";

import { ListPanel } from "@/components/list-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { displayValue } from "@/lib/utils";

const roleLabel: Record<UserRole, string> = {
  admin: "Admin",
  manager: "Gerente",
  operator: "Operador",
  viewer: "Visualizador",
};

const statusLabel: Record<UserStatus, string> = {
  active: "Ativo",
  inactive: "Inativo",
};

const roleVariant = {
  admin: "primary",
  manager: "warning",
  operator: "default",
  viewer: "default",
} as const;

type TeamTableProps = {
  data?: PublicUserRecord[];
  total: number;
  page: number;
  pageSize: number;
  searchValue: string;
  currentUserId?: string | null;
  onPageChange: (page: number) => void;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onEdit?: (user: PublicUserRecord) => void;
  onChangeRole?: (user: PublicUserRecord) => void;
  onDelete?: (user: PublicUserRecord) => void;
};

function formatCreatedAt(value: Date | string | null | undefined) {
  if (value === null || value === undefined) {
    return displayValue(null);
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return displayValue(null);
  }
  return date.toLocaleDateString("pt-BR");
}

function StatusBadge({ status }: { status: UserStatus | null }) {
  if (!status) {
    return (
      <span className="font-mono text-xs text-muted-foreground">
        {displayValue(null)}
      </span>
    );
  }

  return (
    <Badge variant={status === "active" ? "success" : "destructive"}>
      {statusLabel[status]}
    </Badge>
  );
}

function RoleBadge({ role }: { role: UserRole | null }) {
  if (!role) {
    return (
      <span className="font-mono text-xs text-muted-foreground">
        {displayValue(null)}
      </span>
    );
  }

  return <Badge variant={roleVariant[role]}>{roleLabel[role]}</Badge>;
}

export function TeamTable({
  data = [],
  total,
  page,
  pageSize,
  searchValue,
  currentUserId = null,
  onPageChange,
  onSearchChange,
  onSearchSubmit,
  onEdit,
  onChangeRole,
  onDelete,
}: TeamTableProps) {
  return (
    <ListPanel
      title="Lista de membros"
      totalCount={total}
      page={page}
      pageSize={pageSize}
      onPageChange={onPageChange}
      searchPlaceholder="Buscar membro..."
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      onSearchSubmit={onSearchSubmit}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-foreground">
            <tr>
              <th className="px-4 py-2 text-center font-mono text-xs font-semibold tracking-wide uppercase">
                Membro
              </th>
              <th className="px-4 py-2 text-center font-mono text-xs font-semibold tracking-wide uppercase">
                Permissão
              </th>
              <th className="px-4 py-2 text-center font-mono text-xs font-semibold tracking-wide uppercase">
                Status
              </th>
              <th className="px-4 py-2 text-center font-mono text-xs font-semibold tracking-wide uppercase">
                Criado em
              </th>
              <th className="px-4 py-2 text-center text-xs font-semibold tracking-wide uppercase">
                <span className="sr-only">Ações</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr className="border-t-2 border-border">
                <td className="px-4 py-3">
                  <div className="space-y-0.5">
                    <p className="font-semibold">{displayValue(null)}</p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {displayValue(null)}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <RoleBadge role={null} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={null} />
                </td>
                <td className="px-4 py-3 text-right font-mono">
                  {displayValue(null)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Ações do membro"
                    disabled
                  >
                    <MoreHorizontalIcon />
                  </Button>
                </td>
              </tr>
            ) : (
              data.map((user) => (
                <tr key={user.id} className="border-t-2 border-border">
                  <td className="px-4 py-3">
                    <div className="space-y-0.5">
                      <p className="font-semibold">
                        {displayValue(`${user.firstName} ${user.lastName}`)}
                      </p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {displayValue(user.email)}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge status={user.status} />
                  </td>
                  <td className="px-4 py-3 text-center font-mono">
                    {formatCreatedAt(user.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        data-testid={`user-actions-${user.id}`}
                        aria-label={`Ações de ${user.firstName} ${user.lastName}`}
                        className="inline-flex size-7 items-center justify-center rounded-md hover:bg-muted"
                      >
                        <MoreHorizontalIcon className="size-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="min-w-44">
                        <DropdownMenuItem
                          onClick={() => onEdit?.(user)}
                          data-testid={`user-edit-${user.id}`}
                        >
                          Alterar dados
                        </DropdownMenuItem>
                        {user.id !== currentUserId ? (
                          <>
                            <DropdownMenuItem
                              onClick={() => onChangeRole?.(user)}
                              data-testid={`user-role-${user.id}`}
                            >
                              Alterar permissão
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => onDelete?.(user)}
                              data-testid={`user-delete-${user.id}`}
                            >
                              Deletar usuário
                            </DropdownMenuItem>
                          </>
                        ) : null}
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
