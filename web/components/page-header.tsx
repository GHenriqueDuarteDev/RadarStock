import type { ReactNode } from "react";

type PageHeaderProps = {
  category: string;
  title: string;
  description: string;
  action?: ReactNode;
};

export function PageHeader({
  category,
  title,
  description,
  action,
}: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0 space-y-1">
        <p className="font-mono text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {category}
        </p>
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
