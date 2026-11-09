"use client";

import { catchError, type ErrorInfo } from "next/error";
import { AlertTriangleIcon, RotateCcwIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type SectionErrorProps = {
  title: string;
  description?: string;
};

export function SectionErrorCard({
  title,
  description = "Não foi possível carregar esta seção.",
  retry,
  className,
}: SectionErrorProps & { retry?: () => void; className?: string }) {
  return (
    <Card className={className} role="alert">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangleIcon className="size-4 text-destructive" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {retry ? (
        <CardContent>
          <Button type="button" variant="outline" size="sm" onClick={retry}>
            <RotateCcwIcon data-icon="inline-start" />
            Tentar novamente
          </Button>
        </CardContent>
      ) : null}
    </Card>
  );
}

function SectionErrorFallback(
  props: SectionErrorProps,
  { retry }: ErrorInfo,
) {
  return (
    <SectionErrorCard
      title={props.title}
      description={props.description}
      retry={retry}
    />
  );
}

export const SectionErrorBoundary = catchError(SectionErrorFallback);
