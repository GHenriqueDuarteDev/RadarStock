import Link from "next/link";
import type { ReportCatalogItem } from "@radarstock/contracts";
import { ArrowRightIcon } from "lucide-react";

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

export function ReportsCatalog({ items }: { items: ReportCatalogItem[] }) {
  return (
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
  );
}
