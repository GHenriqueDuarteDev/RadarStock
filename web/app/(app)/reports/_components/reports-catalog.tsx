"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  reportCatalogSchema,
  type ReportCatalogItem,
} from "@radarstock/contracts";
import { ArrowRightIcon } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "cn";

async function readErrorMessage(response: Response) {
  try {
    const data = (await response.json()) as { message?: string };
    return data.message ?? "Não foi possível carregar os relatórios.";
  } catch {
    return "Não foi possível carregar os relatórios.";
  }
}

export function ReportsCatalog() {
  const [items, setItems] = useState<ReportCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const response = await fetch("/api/reports");
      if (!response.ok) {
        throw new Error(await readErrorMessage(response));
      }
      const data = reportCatalogSchema.parse(await response.json());
      setItems(data.items);
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar os relatórios.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  return (
    <div className="space-y-4">
      <PageHeader
        category="Análise"
        title="Relatórios"
        description="Consulte e exporte a operação sem alterar cadastros."
      />

      {loadError ? (
        <p className="text-sm text-destructive">{loadError}</p>
      ) : null}

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando catálogo...</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id} className="h-full">
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-xs text-muted-foreground uppercase">
                  {item.supportsPeriod ? "Com período" : "Snapshot atual"}
                </p>
              </CardContent>
              <CardFooter>
                <Link
                  href={`/reports/${item.id}`}
                  className={cn(buttonVariants(), "inline-flex")}
                >
                  Abrir
                  <ArrowRightIcon data-icon="inline-end" />
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
