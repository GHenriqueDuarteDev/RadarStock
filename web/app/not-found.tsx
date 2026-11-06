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

export default function NotFound() {
  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Página não encontrada</CardTitle>
          <CardDescription>
            O recurso solicitado não existe ou foi movido.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/dashboard" className={cn(buttonVariants())}>
            Voltar para a visão geral
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
