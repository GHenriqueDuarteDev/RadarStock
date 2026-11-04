"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  publicUserRecordSchema,
  type PublicUserRecord,
} from "@radarstock/contracts";
import { PlusIcon } from "lucide-react";
import { z } from "zod";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";

import { ChangeRoleSheet } from "./change-role-sheet";
import { CreateUserSheet } from "./create-user-sheet";
import { DeleteUserDialog } from "./delete-user-dialog";
import { EditUserSheet } from "./edit-user-sheet";
import { TeamMetrics, type TeamMetricsData } from "./team-metrics";
import { TeamTable } from "./team-table";

const usersListSchema = z.array(publicUserRecordSchema);

type TeamSheet =
  | { type: "create" }
  | { type: "edit"; user: PublicUserRecord }
  | { type: "role"; user: PublicUserRecord }
  | { type: "delete"; user: PublicUserRecord }
  | null;

function computeMetrics(users: PublicUserRecord[]): TeamMetricsData {
  return {
    total: users.length,
    active: users.filter((user) => user.status === "active").length,
    inactive: users.filter((user) => user.status === "inactive").length,
    admins: users.filter((user) => user.role === "admin").length,
  };
}

async function readErrorMessage(response: Response) {
  try {
    const data = (await response.json()) as { message?: string };
    return data.message ?? "Não foi possível concluir a operação.";
  } catch {
    return "Não foi possível concluir a operação.";
  }
}

export function TeamView() {
  const [users, setUsers] = useState<PublicUserRecord[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sheet, setSheet] = useState<TeamSheet>(null);

  const loadUsers = useCallback(async () => {
    setLoadError(null);
    const response = await fetch("/api/users");
    if (!response.ok) {
      throw new Error(await readErrorMessage(response));
    }
    const data = usersListSchema.parse(await response.json());
    setUsers(data);
  }, []);

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
        await loadUsers();
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
  }, [loadUsers]);

  const metrics = useMemo(() => computeMetrics(users), [users]);

  function handleCreated(created: PublicUserRecord) {
    setUsers((current) => [...current, created]);
    setSheet(null);
  }

  function handleSaved(updated: PublicUserRecord) {
    setUsers((current) =>
      current.map((user) => (user.id === updated.id ? updated : user)),
    );
    setSheet(null);
  }

  function handleDeleted(id: string) {
    setUsers((current) =>
      current.map((user) =>
        user.id === id ? { ...user, status: "inactive" as const } : user,
      ),
    );
    setSheet(null);
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
            currentUserId={currentUserId}
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
