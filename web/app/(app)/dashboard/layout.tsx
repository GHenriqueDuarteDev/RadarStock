import type { ReactNode } from "react";

type DashboardLayoutProps = {
  children: ReactNode;
  metrics: ReactNode;
  movements: ReactNode;
  distribution: ReactNode;
  recent: ReactNode;
  alerts: ReactNode;
};

// Cada slot é uma Parallel Route: carrega, falha e faz streaming de forma independente.
export default function DashboardLayout({
  children,
  metrics,
  movements,
  distribution,
  recent,
  alerts,
}: DashboardLayoutProps) {
  return (
    <div className="space-y-4">
      {children}
      {metrics}
      <div className="grid items-start gap-3 lg:grid-cols-2">
        {movements}
        {distribution}
        {recent}
        {alerts}
      </div>
    </div>
  );
}
