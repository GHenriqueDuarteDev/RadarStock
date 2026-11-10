# RadarStock Web

Frontend Next.js (App Router) do RadarStock. Páginas autenticadas leem a API no servidor; o BFF em `app/api` fica só para sessão, alertas no header e exportação de relatórios.

Visão geral do monorepo, demo e CI/CD: [README raiz](../README.md).

## Padrão de página

Cada rota de listagem segue o mesmo desenho:

1. **Server Component** em `page.tsx` lê `searchParams` (Zod) e busca dados com `fetchFromApi`.
2. **Suspense** separa métricas da tabela para streaming independente.
3. **`SectionErrorBoundary`** isola falha de uma seção sem derrubar a página.
4. **`error.tsx` / `not-found.tsx`** cobrem falha de rota e recurso inexistente.
5. **Mutações** passam por Server Actions em `_actions.ts` (`mutateApi` + `revalidatePath`).
6. Tabelas e sheets são Client Components e recebem dados já resolvidos.

O dashboard usa Parallel Routes (`@metrics`, `@movements`, `@distribution`, `@recent`, `@alerts`) para cada bloco carregar e falhar sozinho.

Relatórios: catálogo e preview são RSC; filtros vivem na URL; exportação CSV/XLSX/PDF continua no BFF (`/api/reports/[reportId]/export`).

## BFF restante

| Rota | Motivo |
| --- | --- |
| `/api/login`, `/api/logout`, `/api/register` | cookie de sessão (`iron-session`) |
| `/api/alerts*` | polling do header no client |
| `/api/reports/[reportId]/export` | download binário no browser |

Leituras de domínio (`/products`, `/dashboard`, `/reports`, etc.) vão direto da RSC para a API Express.

## Scripts

```bash
npm run dev
npm test
npm run build
```
