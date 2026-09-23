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

---

### Ajuste manual — troca de `httpResource` por `rxResource` na camada de dados

**Data:** 2026-09-23
**Onde:** `CLAUDE.md` (seção Stack e seção Arquitetura)

**Contexto.** O `CLAUDE.md` definia originalmente o consumo da API com `httpResource`.
Identifiquei um atrito de design: o `httpResource` recebe a URL
diretamente e precisa ser criado em contexto de injeção, o que empurraria a montagem de
URL e query params para dentro dos componentes. Isso quebraria a separação de camadas e
deixaria o serviço de API sem uma superfície testável de forma isolada.

**Decisão.** Manter o `MovieApiService` como wrapper puro do `HttpClient`, retornando
`Observable<T>` e concentrando a montagem de URL e parâmetros; e envolver esses métodos
com `rxResource` nas features. O `rxResource` também é estável no Angular 22 e entrega
`value()`, `isLoading()`, `error()` e cancelamento automático da requisição anterior,
preservando a ergonomia de signals nos componentes.

---

## 2026-09-23 — Models da API, MovieApiService e interceptor de erro

**Ferramenta:** Claude Code (Opus 5.5)

**Prompt:**

````markdown
Leia o CLAUDE.md antes de começar.

# Tarefa: models da API, MovieApiService e interceptor de erro
Nesta etapa, apenas a camada de acesso a dados. Não implemente painéis, a lista de filmes,
componentes de UI nem o uso de rxResource nas features. Isso vem nas próximas etapas.

1. Antes de escrever código, consulte https://challenge.outsera.tech/v3/api-docs e confirme
   os paths, os nomes dos campos e os tipos dos cinco endpoints descritos no CLAUDE.md.
   Se algo divergir, pare e me avise antes de prosseguir.

2. Crie os models em `core/api/models/`, um arquivo por grupo, com tipos explícitos:
   - `Movie` (id, year, title, studios, producers, winner)
   - `Page<T>` refletindo o formato Spring, tipando apenas os campos que a aplicação usa
     (content, totalElements, totalPages, number, size, first, last). Não replique campos
     que não serão consumidos.
   - `YearWithMultipleWinners` e a resposta `{ years: [...] }`
   - `StudioWithWinCount` e a resposta `{ studios: [...] }`
   - `ProducerInterval` e `MaxMinWinIntervals` (`{ min, max }`)
   - `MoviesQuery`, o objeto de consulta da lista: `{ page, size, year?, winner? }`,
     onde `page` já está na convenção da API (base 0)

3. Crie `shared/utils/pagination.ts` com as funções puras de conversão entre a página exibida
   na UI (base 1) e a página da API (base 0), além de uma função que, a partir de um `Page<T>`,
   devolve os dados de que o componente de paginação precisa (página atual na base 1, total
   de páginas, se é a primeira e se é a última).

4. Crie `shared/utils/winners.ts` com uma função pura que normaliza a resposta de
   `/winnersByYear` para sempre devolver `Movie[]`, aceitando tanto um array quanto um
   objeto único quanto uma resposta vazia ou nula.

5. Crie o `MovieApiService` em `core/api/`, injetando `HttpClient` e o token com a URL base.
   Ele é um wrapper puro do HttpClient: retorna `Observable<T>`, não conhece signals e não
   guarda estado. Métodos:
   - `getMovies(query: MoviesQuery): Observable<Page<Movie>>`
   - `getYearsWithMultipleWinners(): Observable<YearWithMultipleWinners[]>`
   - `getStudiosWithWinCount(): Observable<StudioWithWinCount[]>`
   - `getMaxMinWinIntervalForProducers(): Observable<MaxMinWinIntervals>`
   - `getWinnersByYear(year: number): Observable<Movie[]>`

   Regras:
   - Os três endpoints que devolvem um objeto com uma única chave (`years`, `studios`) são
     desembrulhados aqui, para que o resto da aplicação receba o array direto.
   - `getWinnersByYear` usa a função de normalização do item 4.
   - Monte os parâmetros com `HttpParams`. Parâmetros opcionais indefinidos **não podem
     aparecer na query string** — nada de `winner=undefined` ou `year=`.
   - Nenhuma URL hardcoded: tudo derivado do token de URL base.

6. Crie um interceptor funcional em `core/interceptors/` que capture `HttpErrorResponse` e
   a converta num erro tipado da aplicação, com uma mensagem legível para a UI e distinção
   entre falha de rede, 4xx e 5xx. Registre-o no `app.config.ts` via `withInterceptors`.
   O interceptor não faz retry, não loga em console em produção e não engole o erro:
   ele propaga o erro convertido.

7. Testes (`*.spec.ts` ao lado de cada arquivo), usando `provideHttpClientTesting` e
   `HttpTestingController`:
   - `MovieApiService`: para cada método, verifique a URL chamada, o método HTTP e os
     parâmetros. Inclua explicitamente os casos em que `year` e `winner` estão ausentes e
     assert que os parâmetros **não** estão presentes na requisição; e o caso `winner: false`,
     garantindo que ele é enviado como `false` e não omitido por ser falsy.
   - Desembrulho de `years` e `studios`, e resposta vazia devolvendo array vazio.
   - `getWinnersByYear`: array, objeto único, resposta nula e ano sem vencedores.
   - Funções puras de paginação e de normalização, cobrindo os limites (primeira página,
     última página, página única, nenhum resultado).
   - Interceptor: erro de rede, 404 e 500 produzem o erro tipado esperado.
   - Chame `httpMock.verify()` no `afterEach`.

# Critérios de aceite
- `npm run lint`, `npm test` e `npm run build` passam sem erros.
- Nenhum teste faz requisição de rede real.
- Nenhum `any` e nenhum `as` para contornar tipagem no código de produção.
- O `MovieApiService` não importa nada de `@angular/core/rxjs-interop` nem usa signals.
````

**Resultado:**

- OpenAPI conferido: paths, campos e tipos dos cinco endpoints batem com o CLAUDE.md. Diferenças
  apenas de nome de schema (`StudioCountPerWin`, `ProducerWithInterval`), sem impacto. Observação:
  o OpenAPI documenta o erro como `{ status, timestamp, message }`, mas a API real devolve
  `ProblemDetail` (`{ type, title, status, detail, instance }`). Por isso o interceptor não
  depende do corpo do erro.
- Models em `core/api/models/`: `movie.model.ts` (`Movie`, `MoviesQuery`,
  `WinnersByYearResponse`), `page.model.ts`, `year-with-multiple-winners.model.ts`,
  `studio-with-win-count.model.ts` e `producer-interval.model.ts`. Propriedades `readonly`;
  os arrays ficaram mutáveis (`T[]`) para casar com as assinaturas pedidas no serviço.
- `shared/utils/pagination.ts`: `toApiPage` (com piso na primeira página), `toUiPage` e
  `toPaginationState`, que usa os campos `first`/`last` devolvidos pela API.
- `shared/utils/winners.ts`: `normalizeWinners` (array, objeto único, `null`/`undefined`).
- `core/api/movie-api.service.ts`: wrapper do `HttpClient`, sem signals; filtros opcionais só
  entram no `HttpParams` quando `!== undefined`, então `winner: false` é enviado. `years` e
  `studios` são desembrulhados, com corpo nulo virando array vazio.
- `core/interceptors/app-http-error.ts` (`AppHttpError` com `kind`: `network`, `client`,
  `server` ou `unknown`, `status`, `url` e mensagem em inglês para a UI; 404 tem mensagem
  própria) e `http-error.interceptor.ts`, registrado em `app.config.ts` via
  `withInterceptors`. Sem retry, sem log; erros que não são `HttpErrorResponse` passam intactos.
- Specs ao lado de cada arquivo (34 testes novos, 43 no total). `npm run lint`, `npm test` e
  `npm run build` passaram.

**Ajustes manuais:**

- Removido o tratamento especial do 404 em `app-http-error.ts` (constante `NOT_FOUND_MESSAGE`).
  Nenhum dos endpoints consumidos documenta 404 (só `/api/movies/{id}`, que não é usado); na
  aplicação um 404 indicaria erro de configuração, e "dados não encontrados" seria enganoso. O
  404 passa a usar a mensagem genérica de 4xx, e cada `kind` tem uma única mensagem. O `status`
  continua disponível no `AppHttpError`.
- No spec do interceptor, o teste de 404 agora espera a mensagem genérica, e o teste de 400
  foi removido por ficar redundante.
- Comentário de `WinnersByYearResponse` (`core/api/models/movie.model.ts`) reescrito para
  explicar a origem de cada forma do tipo: o OpenAPI e a API real devolvem array, o PDF do teste
  mostra um objeto único (por isso os dois são aceitos), e `null` cobre corpo vazio, que o
  `HttpClient` converte em `null`. O tipo foi mantido, e o `TODO` que pedia a revisão do
  comentário foi removido.

---

## 2026-09-23 — Componentes compartilhados de UI

**Ferramenta:** Claude Code (Opus 5.5)

**Prompt:**

````markdown
Leia o CLAUDE.md antes de começar.

# Tarefa: componentes compartilhados de UI
Nesta etapa, apenas os componentes reutilizáveis em `shared/ui/`. Não implemente os painéis
do dashboard, a lista de filmes nem nenhuma chamada à API. Todos os componentes desta etapa
são puramente apresentacionais: recebem `input()`, emitem `output()` e não injetam serviços.

1. `PanelComponent` — o cartão que envolve cada bloco do dashboard.
   - `title = input.required<string>()`
   - projeta o conteúdo no corpo do cartão
   - visual conforme o anexo 1: borda, cabeçalho com o título em negrito, corpo com padding

2. `DataTableComponent<T>` — a tabela genérica usada em todas as telas.
   - `columns = input.required<TableColumn<T>[]>()`, onde
     `TableColumn<T> = { key: keyof T & string; header: string; align?: 'start' | 'center' | 'end' }`
   - `rows = input.required<readonly T[]>()`
   - `emptyMessage = input('No records found')`, exibido quando `rows` está vazio
   - um slot de projeção opcional renderizado como **segunda linha
     do cabeçalho**, para os filtros embutidos da lista de filmes (anexo 2)
   - genérico de verdade: use a estratégia de tipagem contextual do Angular
     (`static ngTemplateContextGuard` ou tipagem genérica no seletor) para que `strictTemplates`
     valide os tipos, sem recorrer a `any`
   - `@for` com `track` por uma chave estável, não por índice
   - semântica e acessibilidade: `<thead>`/`<tbody>`, `scope="col"` nos cabeçalhos
   - classes do Bootstrap para o visual de tabela listrada e com borda; envolva a tabela num
     container com `overflow-x: auto`

3. `PaginationComponent` — conforme o anexo 2.
   - `currentPage = input.required<number>()` (base 1), `totalPages = input.required<number>()`
   - `maxVisiblePages = input(5)`
   - `pageChange = output<number>()`
   - botões: primeira, anterior, janela de páginas numeradas, próxima, última
   - desabilita primeira/anterior na primeira página e próxima/última na última
   - não renderiza nada quando `totalPages <= 1`
   - a página ativa tem destaque visual e `aria-current="page"`
   - o cálculo da janela de páginas visíveis fica numa **função pura** em `shared/utils/`,
     não dentro do componente
   - `<nav>` com `aria-label` e botões com rótulo acessível

4. `LoadingIndicatorComponent` — spinner do Bootstrap, com `role="status"` e texto para
   leitor de tela.

5. `ErrorStateComponent`
   - `message = input('Something went wrong. Please try again.')`
   - `retry = output<void>()`, com um botão "Try again"
   - `role="alert"`

6. `EmptyStateComponent`
   - `message = input.required<string>()`
   - visual discreto, apenas texto centralizado


# Testes
Um `*.spec.ts` por componente, testando o DOM renderizado, não detalhes internos:
- `DataTableComponent`: renderiza os cabeçalhos na ordem das colunas; renderiza uma linha
  por item; exibe `emptyMessage` com lista vazia; o slot de filtros aparece no `<thead>`
  quando projetado e não aparece quando ausente.
- `PaginationComponent`: não renderiza com `totalPages` 0 ou 1; desabilita os botões nos
  extremos; emite `pageChange` com o número correto ao clicar; a página ativa tem
  `aria-current`.
- Função pura da janela de páginas: início, meio e fim do intervalo, e total de páginas
  menor que a janela.
- `ErrorStateComponent`: emite `retry` ao clicar no botão.
- `PanelComponent`, `LoadingIndicatorComponent` e `EmptyStateComponent`: renderizam título,
  conteúdo projetado e mensagem.

# Critérios de aceite
- `npm run lint`, `npm test` e `npm run build` passam sem erros.
- Nenhum componente desta etapa injeta serviço, faz requisição ou conhece a API.
- Nenhum `any` no código de produção, inclusive na tipagem genérica da tabela.
- O layout dos componentes não quebra em 768x1280 nem em 360x800.
````

**Resultado:**

- Seis componentes standalone em `shared/ui/`, um por pasta (`panel`, `data-table`,
  `pagination`, `loading-indicator`, `error-state`, `empty-state`), sem serviços injetados e
  sem conhecimento da API. OnPush não é declarado porque já é o padrão do Angular 22.
- `DataTableComponent<T>`: genérico na classe; o Angular infere `T` a partir dos bindings
  `[rows]` e `[columns]`, e o `strictTemplates` rejeita linhas incompatíveis com as colunas
  (verificado com uma alteração temporária no spec, que gerou TS2322). Colunas rastreadas por
  `column.key`; linhas por um input opcional `trackBy` (função `(row: T) => unknown`), que por
  padrão usa a identidade do objeto. Os filtros são projetados por `<ng-content
  select="[appTableFilters]">` dentro do `<thead>`: quem usa a tabela fornece o `<tr>` inteiro,
  com uma célula por coluna. Wrapper `.table-responsive` (Bootstrap) para o `overflow-x: auto`.
- `visiblePageRange(currentPage, totalPages, maxVisible)` em `shared/utils/pagination.ts`:
  janela centrada na página atual, deslocada para caber em `1..totalPages`, com valores fora do
  intervalo ajustados aos limites.
- `PaginationComponent`: `<nav aria-label="Pagination">`, botões com `aria-label` (“First page”,
  “Page 3”…), ícones com `aria-hidden`, `flex-wrap` para telas estreitas. Não emite ao clicar
  na página atual.
- Specs ao lado de cada componente, mais 8 testes da função pura (78 testes no total).
  `npm run lint`, `npm test`, `npm run build` e `prettier --check` passaram.
- Responsividade não verificada no navegador, porque nenhuma página usa os componentes ainda.
  A análise se baseou nas classes: tabela com rolagem horizontal, paginação e alerta de erro
  com quebra de linha.

**Ajustes manuais:**

- Removido o sufixo `.component` dos nomes de arquivo em `shared/ui/` (`panel.ts`,
  `data-table.ts`/`.html`, `pagination.ts`/`.html`, `loading-indicator.ts`, `error-state.ts`,
  `empty-state.ts` e os respectivos `.spec.ts`), seguindo o padrão do Angular 22 e a convenção
  do shell. As classes mantiveram os nomes (`PanelComponent` etc.); imports e `templateUrl`
  foram atualizados.
- No spec da `DataTableComponent`, o teste da linha de filtros projetada passou a inspecionar o
  DOM renderizado: existe um único `tr[appTableFilters]`, seu pai é o `<thead>` da tabela e ele é
  o segundo filho do `<thead>` (portanto dentro da tabela, não fora dela).
- O teste de ausência do slot passou a verificar explicitamente que o `<thead>` tem um único
  filho, apenas a linha de cabeçalhos com um `th[scope="col"]` por coluna, e que nenhum
  `[appTableFilters]` é renderizado.

---

## 2026-09-23 — Página do dashboard e três painéis

**Ferramenta:** Claude Code (Opus 5.5)

**Prompt:**

````markdown
Leia o CLAUDE.md antes de começar.

# Tarefa: página do dashboard e três painéis
Nesta etapa, o grid do dashboard e três dos quatro painéis. O painel de busca por ano
("List movie winners by year") fica para a próxima etapa: deixe o espaço dele no grid
ocupado por um placeholder vazio, sem lógica.

1. `features/dashboard/dashboard.page.ts`
   - grid com duas colunas em telas largas e uma coluna abaixo de 992px
   - layout conforme o anexo 1: anos e estúdios na primeira linha; intervalos de produtores
     e busca por ano na segunda
   - a página apenas posiciona os painéis; não injeta serviço nem busca dados

2. Cada painel é um container autônomo em `features/dashboard/panels/`, usando
   `PanelComponent` como invólucro. Cada um injeta o `MovieApiService`, cria o próprio
   `rxResource` e encadeia os estados no template.
   
   Se um endpoint falhar, os outros painéis continuam funcionando.

3. `MultipleWinnersPanel` — título "List years with multiple winners".
   - colunas: Year, Win Count
   - usa `DataTableComponent`, sem reordenar os dados: a ordem da API é preservada
   - estado vazio quando não há anos com mais de um vencedor

4. `TopStudiosPanel` — título "Top 3 studios with winners".
   - colunas: Name, Win Count
   - o endpoint devolve **todos** os estúdios: a seleção dos três é responsabilidade
     do front-end
   - crie `shared/utils/studios.ts` com uma **função pura** que ordena por `winCount`
     decrescente, desempata por nome em ordem alfabética e devolve os N primeiros
     (N com valor padrão 3, parametrizável). A função não altera o array recebido.
   - o painel apenas chama a função; nenhuma ordenação dentro do template ou do componente

5. `ProducerIntervalsPanel` — título "Producers with longest and shortest interval between wins".
   - um único painel com duas tabelas: primeiro "Maximum" (dados de `max`), depois "Minimum"
     (dados de `min`), cada uma com um subtítulo, conforme o anexo 1
   - colunas: Producer, Interval, Previous Year, Following Year
   - `min` e `max` são arrays: renderize **todos** os registros, não apenas o primeiro
   - passe um `trackBy` composto (`producer` + `previousWin`), porque o mesmo produtor pode
     aparecer mais de uma vez
   - se um dos arrays vier vazio, a tabela correspondente mostra o estado vazio, sem quebrar
     a outra
   - não reordene os dados da API

# Testes
Um `*.spec.ts` por painel, com `provideHttpClientTesting` e `HttpTestingController`.
A aplicação é zoneless: depois de responder a requisição no mock, aguarde a estabilização
(`await fixture.whenStable()`) antes de assertar o DOM. Não use `setTimeout` nem
`fakeAsync`/`tick` para contornar isso.

Para cada painel:
- chama o endpoint correto ao inicializar
- renderiza as linhas esperadas em caso de sucesso
- exibe o estado de erro quando a requisição falha, e o botão "Try again" refaz a chamada
- exibe o estado vazio quando a resposta vem sem registros

Específicos:
- `TopStudiosPanel`: com mais de três estúdios, renderiza exatamente três, na ordem correta
- `ProducerIntervalsPanel`: renderiza as duas tabelas; com dois registros empatados em `max`,
  ambos aparecem; com `min` vazio e `max` preenchido, uma tabela mostra vazio e a outra
  mostra os dados
- Função pura de estúdios (teste próprio): ordenação, desempate alfabético no terceiro lugar,
  entrada com menos de três itens, entrada vazia, e confirmação de que o array original não
  é modificado

- `dashboard.page.spec.ts`: renderiza os quatro invólucros de painel na ordem esperada

# Critérios de aceite
- `npm run lint`, `npm test` e `npm run build` passam sem erros.
- Nenhum teste faz requisição de rede real; `httpMock.verify()` roda no `afterEach`.
- Nenhum `any` no código de produção.
- Rodando `npm start`, o dashboard carrega os três painéis com dados reais da API.
- O grid não quebra em 768x1280 nem em 360x800.
````

**Resultado:**

- `topStudios(studios, count = 3)` em `shared/utils/studios.ts`: copia o array, ordena por
  `winCount` decrescente com desempate por `localeCompare(..., 'en')` e corta nos `count`
  primeiros (contagem negativa vira lista vazia). Spec próprio com 7 testes.
- Três painéis em `features/dashboard/panels/{multiple-winners,top-studios,producer-intervals}/`,
  cada um com `rxResource` próprio (`defaultValue` para o template não lidar com `undefined`)
  e a cadeia `isLoading` → `error` (com `reload()` no "Try again") → tabela. O top 3 é aplicado
  no `stream` (`map(topStudios)`), então o componente e o template não ordenam nada.
- O estado vazio usa o `emptyMessage` da `DataTableComponent` (cabeçalhos visíveis e uma linha
  com a mensagem), o que atende naturalmente ao caso de `min` vazio com `max` preenchido.
- `ProducerIntervalsPanel` com template em arquivo, duas `<section>` com subtítulos `h3`
  ("Maximum" e depois "Minimum") e `trackBy` `producer|previousWin`.
- `DashboardPage`: `row g-3` com `col-12 col-lg-6` (duas colunas a partir de 992px), `h1`
  visualmente oculto e o quarto espaço ocupado por um `app-panel` vazio com o título
  "List movie winners by year".
- Testes: nos specs dos painéis, `TestBed.tick()` dispara a primeira renderização (o
  `fixture.whenStable()` não resolve enquanto a requisição do resource está pendente) e
  `await fixture.whenStable()` roda depois de cada `flush`. `app.routes.spec.ts` passou a
  prover `HttpClient` de teste e `API_BASE_URL`, porque o dashboard agora faz requisições.
- 106 testes passando; `npm run lint`, `npm run build` e `prettier --check` sem erros.
- Verificado com `ng serve` e Chrome headless: dados reais nos três painéis em 1280x900 (duas
  colunas) e 768x1280 (uma coluna); em 360px, verificado num iframe, os cartões cabem na tela
  e as tabelas rolam na horizontal.

**Ajustes manuais:**

- **Mensagem de erro nos painéis.** Os painéis passaram a mostrar a mensagem do `AppHttpError`
  gerado pelo interceptor. A função `appErrorMessage(error)`, em `core/interceptors/app-http-error.ts`,
  devolve a mensagem de um `AppHttpError` ou `undefined` para qualquer outro erro, e cada
  painel a expõe por um `computed` ligado ao `[message]` do `ErrorStateComponent`. O input
  `message` do componente ganhou um `transform` que troca `undefined` pela mensagem padrão,
  então o fallback continua definido num único lugar. Os specs dos painéis passaram a
  registrar o `httpErrorInterceptor` e ganharam um teste que confere a mensagem de erro 500
  ("The server is unavailable at the moment. Please try again later.") na tela. Também foram
  adicionados testes para `appErrorMessage` e para o fallback do `ErrorStateComponent`.
- **Mensagens de estado vazio.** Troquei as mensagens por frases sobre o domínio: "No year has
  more than one winner" (anos), "No studio has won yet" (estúdios) e "No producer has won more
  than once" (as duas tabelas de intervalos, porque qualquer intervalo exige ao menos duas
  vitórias do mesmo produtor). Os specs foram atualizados.
- **`<h1>` do dashboard.** O `<h1>` usava a classe `visually-hidden` do Bootstrap (esconde
  por recorte e continua acessível a leitores de tela), não `display: none`. Como o teste de
  rota pode se ancorar no título visível do primeiro painel ("List years with multiple
  winners"), o `<h1>` foi removido e o teste em `app.routes.spec.ts` foi atualizado.

---

## 2026-09-23 — Painel de busca de vencedores por ano

**Ferramenta:** Claude Code (Opus 5.5)

**Prompt:**

````markdown
Leia o CLAUDE.md antes de começar.

# Tarefa: painel de busca de vencedores por ano
Nesta etapa, apenas o quarto painel do dashboard, substituindo o placeholder deixado na
etapa anterior. Não altere os outros painéis nem comece a lista de filmes.

1. `WinnersByYearPanel` em `features/dashboard/panels/`, com `PanelComponent` como invólucro
   e título "List movie winners by year".

2. Formulário de busca, conforme o anexo 1: um campo de texto com placeholder
   "Search by year" e um botão ao lado com ícone de lupa.
   - A busca dispara no clique do botão **e** ao pressionar Enter no campo. Não há debounce
     nem busca automática ao digitar: este painel é acionado explicitamente pelo usuário.
   - O campo aceita apenas dígitos (`inputmode="numeric"`), com no máximo 4 caracteres.
   - Validação: só dispara com exatamente 4 dígitos. Com valor inválido ou vazio, o botão
     fica desabilitado e nenhuma requisição é feita.
   - O campo tem rótulo acessível (`aria-label`), já que não há `<label>` visível no anexo.

3. Estado e requisição:
   - Mantenha um signal com o termo digitado e outro com o ano efetivamente submetido.
     Apenas o segundo alimenta o `rxResource`.
   - O `params` do `rxResource` retorna `undefined` enquanto nenhum ano válido foi submetido,
     de modo que **nenhuma requisição é disparada na inicialização**. Não use flag booleana
     nem `if` no componente para controlar isso.
   - Submeter o mesmo ano duas vezes deve refazer a busca (use `reload()` quando o valor
     submetido não mudou).

4. Resultado:
   - `DataTableComponent` com as colunas Id, Year e Title, conforme o anexo 1.
   - Os cabeçalhos da tabela ficam visíveis desde o início, mesmo antes da primeira busca.
   - Três estados distintos, com mensagens diferentes:
     - antes de qualquer busca: `EmptyStateComponent` com uma mensagem convidando a buscar
       (este é o uso previsto para o componente, que ainda não estava sendo usado);
     - busca feita e ano sem vencedores: mensagem informando que o ano não tem vencedores,
       incluindo o ano buscado;
     - erro: `ErrorStateComponent` com a mensagem do `AppHttpError` e botão "Try again" que
       refaz a busca do ano atual.
   - O serviço já normaliza a resposta para `Movie[]`; o painel não trata objeto único.

# Testes
`provideHttpClientTesting` e `HttpTestingController`, com o mesmo padrão de sincronização
zoneless usado na tarefa anterior.

- nenhuma requisição é feita ao inicializar o painel
- o botão começa desabilitado e permanece desabilitado com 1, 2 ou 3 dígitos
- com 4 dígitos, o botão habilita e o clique dispara `GET /winnersByYear?year=...` com o
  ano correto
- Enter no campo dispara a mesma requisição que o clique
- resposta com filmes renderiza uma linha por filme, com Id, Year e Title
- resposta vazia mostra a mensagem específica de "ano sem vencedores", não a mensagem
  inicial
- antes de qualquer busca, aparece a mensagem inicial
- erro 500 mostra o estado de erro, e "Try again" refaz a requisição do mesmo ano
- buscar um segundo ano substitui o resultado anterior

# Critérios de aceite
- `npm run lint`, `npm test` e `npm run build` passam sem erros.
- `httpMock.verify()` no `afterEach`, e nenhuma requisição pendente ao inicializar.
- Nenhum `any` no código de produção.
- Rodando `npm start`, buscar 1986 traz dois vencedores e buscar 1987 traz um.
- O painel não quebra em 768x1280 nem em 360x800.
````

**Resultado:**

- `WinnersByYearPanel` em `features/dashboard/panels/winners-by-year/`, dentro de
  `PanelComponent` com o título "List movie winners by year", substituindo o placeholder no
  `DashboardPage`.
- Campo com `inputmode="numeric"`, `maxlength="4"`, placeholder "Search by year" e
  `aria-label="Search winners by year"`; botão com ícone de lupa em SVG inline (sem biblioteca de
  ícones) e `aria-label="Search"`. O handler de `input` remove tudo que não é dígito e escreve o
  valor limpo de volta no elemento.
- Estado: `term` (o que foi digitado) e `submittedYear` (o último ano submetido). Só o segundo
  alimenta o `rxResource`, cujo `params` devolve `undefined` até a primeira busca, então nada é
  requisitado na inicialização. `search()` (clique e `keydown.enter`) ignora termos inválidos;
  se o ano submetido for igual ao atual, chama `reload()`, senão atualiza o signal.
- Estados: loading → erro (`ErrorStateComponent` com a mensagem do `AppHttpError` e `reload()`
  no "Try again") → tabela Id/Year/Title. Os cabeçalhos aparecem desde o início; a linha vazia
  mostra um `EmptyStateComponent` com "Enter a year to see its winners" antes da primeira busca
  e "No winners found for {ano}" depois de uma busca sem resultados.
- `DataTableComponent` ganhou um slot `[appTableEmpty]` dentro da célula de linha vazia, com o
  `emptyMessage` como conteúdo de fallback do `<ng-content>`; os usos existentes não mudam.
  Dois testes novos no spec da tabela cobrem o slot.
- Spec do painel com 12 testes (nenhuma requisição no init, botão desabilitado com 0 a 3
  dígitos, Enter com valor incompleto não busca, filtragem de não dígitos, clique e Enter
  disparam `GET /winnersByYear?year=...`, linhas renderizadas, mensagem de ano sem vencedores,
  erro 500 com retry do mesmo ano, segundo ano substitui o primeiro, mesmo ano duas vezes refaz
  a requisição). As fixtures usam os dados reais da API (ids 36, 37 e 41).
- 126 testes passando; `npm run lint`, `npm run build` e `prettier --check` sem erros.
- Verificado com `ng serve` e Chrome headless via DevTools Protocol, em 768x1280 e 360x800:
  estado inicial com botão desabilitado, 1986 por clique traz dois vencedores, 1987 por Enter
  traz um, e a página não tem rolagem horizontal.

**Ajustes manuais:**

- **Busca por `<form>` com `(ngSubmit)`.** O `(keydown.enter)` no campo foi removido. O campo e
  o botão ficam dentro de um `<form class="input-group" role="search" (ngSubmit)="search()">`,
  com o botão em `type="submit"`, e o submit do form passa a ser o único caminho da busca, pelo
  Enter e pelo clique. O painel importa `FormsModule` para ter o `ngSubmit`; o `NgForm` também
  cancela o submit nativo, então a página não navega. A guarda `if (!isValidTerm())` continua no
  `search()`. Nos testes, o clique usa `button.click()`, que submete o form. O Enter usa
  `form.requestSubmit()`, porque o jsdom não implementa o envio implícito. Um teste dispara
  `submit` direto no form com "198", passando por cima do botão desabilitado, e confirma que a
  guarda não deixa sair requisição. No Chrome, via DevTools Protocol, um Enter de verdade no
  campo buscou 1987, e com "198" nada foi requisitado.
