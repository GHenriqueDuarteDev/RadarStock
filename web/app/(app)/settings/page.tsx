import { Suspense } from "react";
import {
  alertRulesListSchema,
  publicCategorySchema,
} from "@radarstock/contracts";
import { z } from "zod";

import { fetchFromApi, getCurrentUser } from "@/app/_lib/server-api";
import { PageHeader } from "@/components/page-header";
import { SectionErrorBoundary } from "@/components/section-error";
import { TablePanelSkeleton } from "@/components/section-skeletons";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { AlertRulesPanel } from "./_components/alert-rules-panel";
import { CategoriesTable } from "./_components/categories-table";

const categoriesListSchema = z.array(publicCategorySchema);

function AlertRulesSkeleton() {
  return (
    <Card className="w-fit gap-0 p-0">
      <CardHeader className="space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-56" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-80" />
        ))}
      </CardContent>
    </Card>
  );
}

async function CategoriesSection() {
  const categories = await fetchFromApi("/categories", categoriesListSchema);
  return <CategoriesTable data={categories} />;
}

async function AlertRulesSection() {
  const [rules, currentUser] = await Promise.all([
    fetchFromApi("/alert-rules", alertRulesListSchema),
    getCurrentUser(),
  ]);

  return (
    <AlertRulesPanel
      rules={rules.items}
      canEdit={currentUser?.role === "admin"}
    />
  );
}

export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        category="Sistema"
        title="Configurações"
        description="Gerencie categorias do catálogo e gatilhos de alertas operacionais."
      />
      <div className="space-y-4 flex gap-5">
        <SectionErrorBoundary title="Categorias indisponíveis">
          <Suspense fallback={<TablePanelSkeleton />}>
            <CategoriesSection />
          </Suspense>
        </SectionErrorBoundary>
        <SectionErrorBoundary title="Gatilhos indisponíveis">
          <Suspense fallback={<AlertRulesSkeleton />}>
            <AlertRulesSection />
          </Suspense>
        </SectionErrorBoundary>
      </div>
    </div>
  );
}
