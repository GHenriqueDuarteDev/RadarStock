# RadarStock API

Backend Express (TypeScript) do RadarStock. Expõe o domínio de estoque por HTTP JSON e é consumida pelo web (RSC / Server Actions / BFF), autenticada por usuário interno e protegida por `INTERNAL_SECRET`.

Visão geral do monorepo, demo e CI/CD: [README raiz](../README.md). Contratos compartilhados: [`contracts/`](../contracts/).

## Camadas

```text
routes → controllers → services → Prisma / Postgres
```

| Camada | Responsabilidade |
| --- | --- |
| **routes** | Paths, middlewares (`requireInternalUser`, `requirePermission`) |
| **controllers** | Parse/validação Zod (`@radarstock/contracts`) e status HTTP |
| **services** | Regras de negócio, transações de estoque, alertas, relatórios |
| **prisma** | Schema, migrations e seed de demo |

RBAC: papéis `admin`, `manager`, `operator`, `viewer` alinhados à matriz em `@radarstock/contracts`.

## Domínio (resumo)

Produtos, categorias, galpões, saldos, movimentações, vendas, recebimentos, inventários, dashboard, alertas/regras e exportação de relatórios (CSV / XLSX / PDF).

## Scripts

```bash
npm run dev
npm test
npm run db:seed
```

No Docker Compose, a API sobe junto com Postgres; migrations e seed seguem o fluxo do README raiz.
