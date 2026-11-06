import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "cn";

export default function ReportNotFound() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Relatório não encontrado</CardTitle>
        <CardDescription>
          O identificador informado não corresponde a um relatório disponível.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Link href="/reports" className={cn(buttonVariants())}>
          Voltar ao catálogo
        </Link>
      </CardContent>
    </Card>
  );
}
