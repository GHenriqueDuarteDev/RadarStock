const demoAccounts = [
  {
    role: "Admin",
    email: "admin@radarstock.local",
    password: "Admin123!",
    note: "pré-preenchido",
  },
  {
    role: "Manager",
    email: "ana.silva@radarstock.local",
    password: "Membro123!",
  },
  {
    role: "Operator",
    email: "bruno.costa@radarstock.local",
    password: "Membro123!",
  },
  {
    role: "Viewer",
    email: "carla.dias@radarstock.local",
    password: "Membro123!",
  },
] as const;

export function DemoNotice() {
  return (
    <aside
      className="w-full rounded-lg border border-border bg-muted/50 p-4 text-sm text-muted-foreground"
      aria-label="Aviso de demonstração"
    >
      <p className="font-medium text-foreground">
        Projeto de portfólio — não é um produto real
      </p>
      <p className="mt-2">
        Os dados são fictícios e servem apenas para demonstração técnica.
      </p>
      <p className="mt-2">
        O primeiro login pode demorar cerca de 30–60 segundos (plano gratuito do
        Render). Se falhar, tente novamente.
      </p>
      <p className="mt-3 font-medium text-foreground">Contas de demo</p>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="py-1.5 pr-2 font-medium">Papel</th>
              <th className="py-1.5 pr-2 font-medium">E-mail</th>
              <th className="py-1.5 font-medium">Senha</th>
            </tr>
          </thead>
          <tbody>
            {demoAccounts.map((account) => (
              <tr key={account.email} className="border-b border-border/60 last:border-0">
                <td className="py-1.5 pr-2 align-top whitespace-nowrap">
                  {account.role}
                  {"note" in account ? (
                    <span className="block text-[0.65rem] text-muted-foreground">
                      {account.note}
                    </span>
                  ) : null}
                </td>
                <td className="py-1.5 pr-2 align-top font-mono break-all">
                  {account.email}
                </td>
                <td className="py-1.5 align-top font-mono whitespace-nowrap">
                  {account.password}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </aside>
  );
}
