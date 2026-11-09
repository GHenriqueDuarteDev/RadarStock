import { displayValue } from "@/lib/utils";

type DashboardWelcomeProps = {
  email?: string | null;
};

function displayNameFromEmail(email: string) {
  const local = email.split("@")[0] ?? email;
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function DashboardWelcome({ email }: DashboardWelcomeProps) {
  const name = email ? displayNameFromEmail(email) : displayValue(null);

  return (
    <div className="min-w-0 space-y-1">
      <h1 className="text-xl font-semibold tracking-tight">Olá, {name}</h1>
      <p className="text-sm text-muted-foreground">
        Aqui está o resumo da sua operação hoje.
      </p>
    </div>
  );
}
