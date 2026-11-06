"use client";

import { useCallback, useEffect, useState } from "react";
import {
  PAGE_SIZE,
  paginatedUsersSchema,
  usersSummarySchema,
  type PublicUserRecord,
} from "@radarstock/contracts";
import { PlusIcon } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";

import { ChangeRoleSheet } from "./change-role-sheet";
import { CreateUserSheet } from "./create-user-sheet";
import { DeleteUserDialog } from "./delete-user-dialog";
import { EditUserSheet } from "./edit-user-sheet";
import { TeamMetrics, type TeamMetricsData } from "./team-metrics";
import { TeamTable } from "./team-table";

type TeamSheet =
  | { type: "create" }
  | { type: "edit"; user: PublicUserRecord }
  | { type: "role"; user: PublicUserRecord }
  | { type: "delete"; user: PublicUserRecord }
  | null;

async function readErrorMessage(response: Response) {
  try {
    const data = (await response.json()) as { message?: string };
    return data.message ?? "Não foi possível concluir a operação.";
  } catch {
    return "Não foi possível concluir a operação.";
  }
}

function buildUsersQuery(page: number, name: string) {
  const query = new URLSearchParams({ page: String(page) });
  const trimmedName = name.trim();
  if (trimmedName !== "") {
    query.set("name", trimmedName);
  }
  return query.toString();
}

export function TeamView() {
  const [users, setUsers] = useState<PublicUserRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [appliedName, setAppliedName] = useState("");
  const [metrics, setMetrics] = useState<TeamMetricsData | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sheet, setSheet] = useState<TeamSheet>(null);

  const loadUsers = useCallback(async (nextPage: number, name: string) => {
    setLoadError(null);
    const response = await fetch(
      `/api/users?${buildUsersQuery(nextPage, name)}`,
    );
    if (!response.ok) {
      throw new Error(await readErrorMessage(response));
    }
    const data = paginatedUsersSchema.parse(await response.json());
    setUsers(data.items);
    setTotal(data.total);
    setPage(data.page);
  }, []);

  const loadSummary = useCallback(async () => {
    const response = await fetch("/api/users/summary");
    if (!response.ok) {
      throw new Error(await readErrorMessage(response));
    }
    const data = usersSummarySchema.parse(await response.json());
    setMetrics(data);
  }, []);

  const refreshAfterMutation = useCallback(async () => {
    await Promise.all([loadUsers(page, appliedName), loadSummary()]);
  }, [appliedName, loadSummary, loadUsers, page]);

  useEffect(() => {
    let cancelled = false;

    async function initialLoad() {
      setLoading(true);
      try {
        const meResponse = await fetch("/api/me");
        if (meResponse.ok) {
          const me = (await meResponse.json()) as { id?: string };
          if (!cancelled && typeof me.id === "string") {
            setCurrentUserId(me.id);
          }
        }
        await Promise.all([loadUsers(1, ""), loadSummary()]);
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            err instanceof Error
              ? err.message
              : "Não foi possível carregar a equipe.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void initialLoad();

    return () => {
      cancelled = true;
    };
  }, [loadSummary, loadUsers]);

  async function handlePageChange(nextPage: number) {
    try {
      await loadUsers(nextPage, appliedName);
    } catch (err) {
      setLoadError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar a equipe.",
      );
    }
  }

  async function handleSearchSubmit() {
    const nextName = searchInput.trim();
    setAppliedName(nextName);
    try {
      await loadUsers(1, nextName);
    } catch (err) {
      setLoadError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar a equipe.",
      );
    }
  }

  async function handleCreated(_created: PublicUserRecord) {
    setSheet(null);
    await refreshAfterMutation();
  }

  async function handleSaved(_updated: PublicUserRecord) {
    setSheet(null);
    await refreshAfterMutation();
  }

  async function handleDeleted(_id: string) {
    setSheet(null);
    await refreshAfterMutation();
  }

  return (
    <>
      <PageHeader
        category="Acesso"
        title="Equipe"
        description="Gerencie membros, permissões e status de acesso."
        action={
          <Button
            type="button"
            data-testid="new-member"
            onClick={() => setSheet({ type: "create" })}
          >
            <PlusIcon data-icon="inline-start" />
            Novo membro
          </Button>
        }
      />
      {loading ? (
        <p className="text-sm text-muted-foreground" data-testid="team-loading">
          Carregando equipe...
        </p>
      ) : loadError ? (
        <p role="alert" className="text-sm text-destructive">
          {loadError}
        </p>
      ) : (
        <>
          <TeamMetrics data={metrics} />
          <TeamTable
            data={users}
            total={total}
            page={page}
            pageSize={PAGE_SIZE}
            searchValue={searchInput}
            currentUserId={currentUserId}
            onPageChange={handlePageChange}
            onSearchChange={setSearchInput}
            onSearchSubmit={handleSearchSubmit}
            onEdit={(user) => setSheet({ type: "edit", user })}
            onChangeRole={(user) => setSheet({ type: "role", user })}
            onDelete={(user) => setSheet({ type: "delete", user })}
          />
        </>
      )}
      {sheet?.type === "create" ? (
        <CreateUserSheet
          onClose={() => setSheet(null)}
          onCreated={handleCreated}
        />
      ) : null}
      {sheet?.type === "edit" ? (
        <EditUserSheet
          key={sheet.user.id}
          user={sheet.user}
          onClose={() => setSheet(null)}
          onSaved={handleSaved}
        />
      ) : null}
      {sheet?.type === "role" ? (
        <ChangeRoleSheet
          key={sheet.user.id}
          user={sheet.user}
          onClose={() => setSheet(null)}
          onSaved={handleSaved}
        />
      ) : null}
      {sheet?.type === "delete" ? (
        <DeleteUserDialog
          key={sheet.user.id}
          user={sheet.user}
          onClose={() => setSheet(null)}
          onDeleted={handleDeleted}
        />
      ) : null}
    </>
  );
}
