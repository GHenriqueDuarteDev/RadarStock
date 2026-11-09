# RadarStock


## Do que se trata esse projeto

O RadarStock nasceu para resolver um problema concreto: dar visibilidade e controle operacional a quem precisa gerenciar estoque, galpões, vendas, recebimentos e inventário sem depender de planilhas frágeis. A aplicação oferece um painel unificado para acompanhar saldos, movimentações, alertas (estoque baixo, galpão perto da capacidade, inventário pendente) e relatórios exportáveis — o tipo de fluxo que um negócio real usaria no dia a dia.

Além do valor de produto, o projeto é um showcase full-stack deliberado: monorepo com `web/`, `api/` e `contracts/`, domínio de inventário com regras e transações, RBAC por papel (admin, manager, operator, viewer) e frontend Next.js App Router usado de forma moderna (RSC, Server Actions, Suspense, Parallel Routes). Serve tanto como base para evoluir a um SaaS de estoque quanto como evidência clara, para recrutadores técnicos, de decisões de arquitetura bem fundamentadas.

O detalhamento do padrão de páginas e do BFF no frontend está em [web/README.md](web/README.md).


## Principais linguagens e tecnologias utilizadas

- **TypeScript**: tipagem ponta a ponta na API, no web e nos contratos compartilhados, antecipando erros de forma e contrato entre camadas.
- **Next.js / React**: leitura via Server Components e `fetchFromApi`; mutações via Server Actions; Suspense e Error Boundaries por seção; Parallel Routes no dashboard; BFF apenas onde precisa (sessão, alertas do header, exportação binária).
- **Express**: API HTTP em camadas (`routes` → `controllers` → `services`), privada ao BFF/web via segredo interno — separação clara entre transporte e regra de negócio.
- **PostgreSQL + Prisma**: modelo relacional de produtos, galpões, saldos, documentos e alertas; mutações de estoque em `$transaction` para manter consistência.
- **Zod (`@radarstock/contracts`)**: schemas e matriz de permissões como fonte única entre API e web — validação na borda e RBAC alinhado nos dois lados.
- **shadcn/ui**: componentes acessíveis e consistentes (sidebar, sheets, dialogs, tabelas) sem reinventar um design system do zero.
- **Docker Compose**: sobe web, API e Postgres juntos, com ambiente reproduzível para demo e onboarding.


## Instruções de instalação e uso

### Uso

- Com o ambiente no ar, acesse: [http://localhost:3000](http://localhost:3000)

### Exemplos de uso

#### Credenciais de demo (após o seed)

| Papel | E-mail | Senha |
| --- | --- | --- |
| Admin | `admin@radarstock.local` | `Admin123!` |
| Manager | `ana.silva@radarstock.local` | `Membro123!` |
| Operator | `bruno.costa@radarstock.local` | `Membro123!` |
| Viewer | `carla.dias@radarstock.local` | `Membro123!` |

Demais usuários seed seguem o padrão `*@radarstock.local` / `Membro123!`.

#### Fluxo sugerido

1. Entre como **admin** e confira o dashboard (métricas, alertas e movimentações).
2. Crie uma venda ou um recebimento e observe o impacto em estoque e alertas.
3. Abra um relatório, ajuste filtros e exporte CSV, XLSX ou PDF.
4. Saia e entre como **viewer** (`carla.dias@radarstock.local`): listas visíveis, sem “Ação rápida”, sem Equipe/Configurações e sem mutações — demonstrando o RBAC.

### Pré-requisitos

- **Docker** e **Docker Compose** (caminho principal deste monorepo)
- **Node.js 22+** e **npm** (opcional, para desenvolver fora dos containers; as imagens do projeto usam Node 22)

### Instalação

#### Ubuntu

1. Instale o Docker Engine e o plugin Compose seguindo a documentação oficial: [Install Docker Engine on Ubuntu](https://docs.docker.com/engine/install/ubuntu/).

2. Clone o repositório:
    ```bash
    git clone https://github.com/GHenriqueDuarteDev/RadarStock.git
    ```

3. Navegue até o diretório do projeto:
    ```bash
    cd RadarStock
    ```

4. Crie o arquivo de ambiente:
    ```bash
    cp .env.example .env
    ```

5. Suba os serviços:
    ```bash
    docker compose up --build
    ```

6. Popule o banco (em outro terminal, com os containers no ar):
    ```bash
    docker compose exec api npm run db:seed
    ```

7. Abra [http://localhost:3000](http://localhost:3000).


#### Windows

1. Instale o [Docker Desktop](https://docs.docker.com/desktop/setup/install/windows-install/) e garanta que o Compose esteja habilitado.

2. Clone o repositório:
    ```cmd
    git clone https://github.com/GHenriqueDuarteDev/RadarStock.git
    ```

3. Navegue até o diretório do projeto:
    ```cmd
    cd RadarStock
    ```

4. Crie o arquivo de ambiente:
    ```cmd
    copy .env.example .env
    ```

5. Suba os serviços:
    ```cmd
    docker compose up --build
    ```

6. Popule o banco:
    ```cmd
    docker compose exec api npm run db:seed
    ```

7. Abra [http://localhost:3000](http://localhost:3000).


#### macOS

1. Instale o [Docker Desktop for Mac](https://docs.docker.com/desktop/setup/install/mac-install/).

2. Clone o repositório:
    ```bash
    git clone https://github.com/GHenriqueDuarteDev/RadarStock.git
    ```

3. Navegue até o diretório do projeto:
    ```bash
    cd RadarStock
    ```

4. Crie o arquivo de ambiente:
    ```bash
    cp .env.example .env
    ```

5. Suba os serviços:
    ```bash
    docker compose up --build
    ```

6. Popule o banco:
    ```bash
    docker compose exec api npm run db:seed
    ```

7. Abra [http://localhost:3000](http://localhost:3000).


## Contato

Se você tiver alguma dúvida, entre em contato:

- **Gustavo Henrique**
- E-mail: [ghrduarte@hotmail.com](mailto:ghrduarte@hotmail.com)
- GitHub: [GHenriqueDuarteDev](https://github.com/GHenriqueDuarteDev)
