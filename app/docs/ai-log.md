# Registro de interações com IA

Histórico das interações com assistentes de IA durante o desenvolvimento deste projeto.

Cada entrada segue a estrutura abaixo:

- **Data** — quando a interação aconteceu.
- **Ferramenta** — assistente e modelo utilizados.
- **Prompt** — o texto integral do pedido.
- **Resultado** — o que a IA produziu.
- **Ajustes manuais** — correções e mudanças feitas por mim depois, à mão.

---

## 2026-09-23 — Configuração inicial do projeto

**Ferramenta:** Claude Code (Opus 5.5)

**Prompt:**

````markdown
Leia o CLAUDE.md antes de começar.

# Tarefa: configuração inicial do projeto
Nesta etapa, apenas a fundação. Não implemente as views, os painéis, os serviços de API
nem os models de domínio. Isso vem nas próximas etapas.

1. Gere o projeto Angular com o CLI (versão estável mais recente) no diretório atual, usando
   npm, SCSS, roteamento habilitado, sem SSR e sem inicializar git (o repositório já existe).
   Preserve o CLAUDE.md. Crie o `.nvmrc` com a versão LTS atual do Node e adicione `engines`
   ao package.json.
2. Ative `strict: true` e `strictTemplates: true` no tsconfig, e confirme que o projeto está
   zoneless (sem zone.js nas dependências nem no polyfills).
3. Instale o Bootstrap 5 e importe **apenas o CSS** no `styles.scss`. Não instale ng-bootstrap
   nem Angular Material.
4. Configure o `app.config.ts` com `provideRouter` e `provideHttpClient`.
   Crie o `InjectionToken` com a URL base da API (`https://challenge.outsera.tech/api/movies`),
   provido a partir do `environment`. Crie os arquivos de environment de dev e produção.
5. Crie a estrutura de pastas vazia descrita no CLAUDE.md (core/api, core/interceptors,
   core/layout, shared/ui, shared/utils, features/dashboard, features/movies) com um
   `.gitkeep` onde ainda não houver arquivo.
6. Crie o shell de layout (`core/layout`): header escuro com o título "Frontend Angular Test"
   e sidebar com os links "Dashboard" e "List", usando `routerLink` e `routerLinkActive`,
   com `<router-outlet>` na área de conteúdo. Layout responsivo conforme o CLAUDE.md.
7. Configure o `app.routes.ts`: rota '' redireciona para 'dashboard'; 'dashboard' e 'movies'
   carregadas com `loadComponent` apontando para páginas placeholder (apenas um título, sem
   lógica); rota curinga para uma página de "não encontrado".
8. Configure ESLint (angular-eslint) e Prettier, com `.editorconfig` e `.gitignore`.
   Adicione Husky + lint-staged rodando lint e format no pre-commit.
9. Crie o README.md inicial com: descrição do projeto, pré-requisitos, instalação, como rodar,
    como rodar os testes, como fazer o build, e as seções vazias "Funcionalidades",
    "Arquitetura", "Decisões técnicas" e "Uso de IA" para preencher depois.
10. Crie `docs/ai-log.md` com a estrutura de registro (data, ferramenta, prompt resumido,
    resultado, ajustes manuais) e a primeira entrada referente a esta tarefa.

# Critérios de aceite
- `npm run lint`, `npm test` e `npm run build` passam sem erros.
- `npm start` sobe a aplicação, o menu navega entre as duas rotas e o link ativo é destacado.
- O layout não quebra em 768x1280 nem em 360x800.
- Nenhum componente usa NgModule, decorators `@Input()`/`@Output()` ou `*ngIf`/`*ngFor`.
````

**Resultado:**

- Projeto gerado com `@angular/cli@22.1.8`
  (`--style scss --routing --ssr=false --skip-git --zoneless --test-runner vitest --ai-config none`)
  em um diretório temporário e copiado para `app/`, preservando `CLAUDE.md` e `docs/`. O README e o template de boas-vindas gerados
  foram descartados.
- `.nvmrc` com `24` (LTS atual) e `engines` alinhado ao exigido pelo Angular 22
  (`^22.22.3 || ^24.15.0 || >=26.0.0`) e npm >= 10.
- `tsconfig.json` com `strict: true` e `strictTemplates: true` explícitos. Zoneless
  confirmado: não há `zone.js` no `package.json`, em `node_modules` nem em `polyfills`
  (o `angular.json` não tem a opção).
- Bootstrap 5.3.8 instalado; `styles.scss` faz apenas `@use 'bootstrap/dist/css/bootstrap.min'`.
- `app.config.ts` com `provideRouter`, `provideHttpClient` e o provider do token
  `API_BASE_URL` (`core/api/api-base-url.token.ts`) a partir de `environment.apiBaseUrl`.
  Environments `environment.ts` (produção) e `environment.development.ts` (dev, via
  `fileReplacements`), tipados pela interface `Environment`.
- Pastas `core/api`, `core/interceptors`, `core/layout`, `shared/ui`, `shared/utils`,
  `features/dashboard` e `features/movies` criadas, com `.gitkeep` nas que ficaram vazias.
- Shell (`core/layout/shell.*`): header `bg-dark` com "Frontend Angular Test", sidebar com
  "Dashboard" e "List" (`routerLink`, `routerLinkActive`, `aria-current`) e `<router-outlet>`
  no `<main>`. Abaixo de 768px a sidebar recolhe e é aberta por um botão no header; escolher um
  link fecha o menu.
- Rotas: `''` → `dashboard`; `dashboard`, `movies` e `**` com `loadComponent` para páginas
  placeholder (`DashboardPage`, `MoviesListPage`, `NotFoundPage`).
- ESLint via `ng add angular-eslint`, com regras extras para as convenções do projeto
  (`prefer-signals`, `prefer-output-emitter-ref`, `no-explicit-any`, proibição de `as`,
  `template/prefer-control-flow`) e `eslint-config-prettier`. Prettier com `.prettierignore`
  (inclui o `CLAUDE.md` e este log, para que o prompt literal não seja reformatado). `.editorconfig` e `.gitattributes` com LF.
- Husky com o hook em `app/.husky/pre-commit` (o repositório Git fica na pasta acima, por isso
  `prepare` é `cd .. && husky app/.husky`) rodando lint-staged: `eslint --fix` e
  `prettier --write` nos `.ts`/`.html` e Prettier nos demais formatos.
- Testes: `shell.spec.ts` (título, links do menu, destaque do link ativo, conteúdo roteado,
  abrir/fechar sidebar) e `app.routes.spec.ts` (redirect, lazy loading e página não
  encontrada). O teste de exemplo do CLI foi removido.
- Verificações: `npm run lint`, `npm test` (9 testes) e `npm run build` passaram. O
  `npm start` foi executado e a aplicação respondeu; screenshots em Edge headless confirmaram
  o layout em 768x1280 (sidebar visível, link ativo destacado) e 360x800 (sidebar recolhida).

**Ajustes manuais:**

- `engines.node` no `package.json` reduzido a uma única versão, `^24.15.0` (alinhada ao
  `.nvmrc`), no lugar das três faixas `^22.22.3 || ^24.15.0 || >=26.0.0`.

---

## 2026-09-23 — Remoção do Husky e do lint-staged

**Ferramenta:** Claude Code (Opus 5.5)

**Prompt:**

````markdown
Leia o CLAUDE.md antes de começar.

# Tarefa: remover o Husky e o lint-staged do projeto
Remova as duas ferramentas por completo. Decisão: manter consistência de tooling com o
projeto de back-end desta mesma avaliação, que não usa git hooks nem lint-staged.

1. Desinstale as dependências `husky` e `lint-staged` do package.json.
2. Remova o script `prepare` do package.json e qualquer outro script criado para os hooks.
3. Remova a configuração do lint-staged, esteja ela no package.json, em `.lintstagedrc`
   ou em arquivo equivalente.
4. Apague o diretório `.husky/` por completo.
5. Desinstale os hooks já ativos no git local, executando `git config --unset core.hooksPath`
   e conferindo com `git config --get core.hooksPath` que não sobrou nada apontando
   para `.husky`. Confira também se não restou nenhum hook dentro de `.git/hooks/`
   além dos arquivos `.sample` padrão.
6. Remova qualquer menção a Husky, lint-staged ou hooks de pre-commit no README.md
   e em outros arquivos de documentação.
7. Atualize o `package-lock.json` rodando `npm install`.

# Não altere
- A configuração do ESLint e do Prettier: as ferramentas permanecem, apenas deixam de
  rodar automaticamente no commit.

# Critérios de aceite
- `npm ci` roda sem erros a partir do lock atualizado.
- `npm run lint`, `npm test` e `npm run build` continuam passando.
- Nenhuma ocorrência de "husky" ou "lint-staged" resta no repositório
  (verifique com uma busca no projeto, ignorando node_modules).
````

**Resultado:**

- `npm uninstall` das duas dependências; script `prepare` e bloco de configuração removidos do
  `package.json` (não havia arquivo `.lintstagedrc` ou equivalente). Os scripts `format` e
  `format:check` foram mantidos, pois não são dos hooks.
- Diretório `.husky/` apagado; `git config --unset core.hooksPath` executado e
  `git config --get core.hooksPath` sem retorno. `.git/hooks/` contém apenas os `.sample`.
- Parágrafo sobre os hooks removido do README. ESLint e Prettier não foram alterados.
- Exceção combinada: este log mantém as entradas anteriores e o prompt literal, então é o
  único lugar onde os nomes das ferramentas continuam aparecendo.
- Verificações: `npm install` atualizou o lock (sem referências às ferramentas); `npm ci`,
  `npm run lint`, `npm test` (9 testes) e `npm run build` passaram. O primeiro `npm ci` falhou
  com EPERM porque um `npm run start` em execução travava o `esbuild.exe`; passou depois que o
  servidor foi encerrado.

**Ajustes manuais:**
