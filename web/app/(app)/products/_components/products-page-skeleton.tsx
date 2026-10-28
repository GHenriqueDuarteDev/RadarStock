import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ProductsPageSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <Skeleton className="h-8 w-32 shrink-0" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} size="sm">
            <CardContent className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <Skeleton className="size-8 rounded-md" />
                <Skeleton className="h-3 w-16" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-7 w-16" />
                <Skeleton className="h-4 w-28" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="border-b-2 border-border [.border-b]:pb-(--card-spacing)">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-4 w-40" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-(--card-spacing)">
          <Skeleton className="h-8 w-full" />
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </CardContent>
        <CardFooter className="justify-between gap-2">
          <Skeleton className="h-4 w-36" />
          <div className="flex items-center gap-1">
            <Skeleton className="h-7 w-20" />
            <Skeleton className="h-7 w-8" />
            <Skeleton className="h-7 w-20" />
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
