"use client";

import { MoreHorizontalIcon } from "lucide-react";
import type { PublicUserRecord, UserRole, UserStatus } from "@radarstock/contracts";

import { ListPanel } from "@/components/list-panel";
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

const statusClassName: Record<UserStatus, string> = {
  active: "bg-success/15 text-success",
  inactive: "bg-critical/15 text-critical",
};

const roleClassName: Record<UserRole, string> = {
  admin: "bg-primary/15 text-primary",
  manager: "bg-warning/20 text-warning-foreground",
  operator: "bg-muted text-foreground",
  viewer: "bg-muted text-muted-foreground",
};

type TeamTableProps = {
  data?: PublicUserRecord[];
  currentUserId?: string | null;
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
    <span
      className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${statusClassName[status]}`}
    >
      {statusLabel[status]}
    </span>
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

  return (
    <span
      className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${roleClassName[role]}`}
    >
      {roleLabel[role]}
    </span>
  );
}

export function TeamTable({
  data = [],
  currentUserId = null,
  onEdit,
  onChangeRole,
  onDelete,
}: TeamTableProps) {
  return (
    <ListPanel
      title="Lista de membros"
      totalCount={data.length}
      searchPlaceholder="Buscar membro..."
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
                  <td className="px-4 py-3">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={user.status} />
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
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
