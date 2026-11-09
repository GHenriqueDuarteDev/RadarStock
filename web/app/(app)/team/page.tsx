import { Suspense } from "react";
import {
  listUsersQuerySchema,
  paginatedUsersSchema,
  usersSummarySchema,
  type ListUsersQuery,
} from "@radarstock/contracts";
import { PlusIcon } from "lucide-react";

import { parseSearchParams, type PageProps } from "@/app/_lib/search-params";
import { fetchFromApi, getCurrentUser } from "@/app/_lib/server-api";
import { PageHeader } from "@/components/page-header";
import { SectionErrorBoundary } from "@/components/section-error";
import {
  MetricsSkeleton,
  TablePanelSkeleton,
} from "@/components/section-skeletons";
import { Button } from "@/components/ui/button";

import { NewMemberButton } from "./_components/new-member-button";
import { TeamMetrics } from "./_components/team-metrics";
import { TeamTable } from "./_components/team-table";

function buildUsersPath(query: ListUsersQuery) {
  const params = new URLSearchParams({ page: String(query.page) });
  if (query.name) {
    params.set("name", query.name);
  }
  return `/users?${params.toString()}`;
}

async function TeamMetricsSection() {
  const summary = await fetchFromApi("/users/summary", usersSummarySchema);
  return <TeamMetrics data={summary} />;
}

async function TeamTableSection({ query }: { query: ListUsersQuery }) {
  const [users, currentUser] = await Promise.all([
    fetchFromApi(buildUsersPath(query), paginatedUsersSchema),
    getCurrentUser(),
  ]);

  return (
    <TeamTable
      data={users.items}
      total={users.total}
      page={users.page}
      pageSize={users.pageSize}
      currentUserId={currentUser?.id ?? null}
    />
  );
}

export default async function TeamPage({ searchParams }: PageProps) {
  const query = parseSearchParams(listUsersQuerySchema, await searchParams);

  return (
    <div className="space-y-4">
      <PageHeader
        category="Acesso"
        title="Equipe"
        description="Gerencie membros, permissões e status de acesso."
        action={
          <Suspense
            fallback={
              <Button type="button" disabled>
                <PlusIcon data-icon="inline-start" />
                Novo membro
              </Button>
            }
          >
            <NewMemberButton />
          </Suspense>
        }
      />
      <SectionErrorBoundary title="Indicadores indisponíveis">
        <Suspense fallback={<MetricsSkeleton />}>
          <TeamMetricsSection />
        </Suspense>
      </SectionErrorBoundary>
      <SectionErrorBoundary title="Lista de membros indisponível">
        <Suspense fallback={<TablePanelSkeleton />}>
          <TeamTableSection query={query} />
        </Suspense>
      </SectionErrorBoundary>
    </div>
  );
}
