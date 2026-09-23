# Golden Raspberry Awards — Front-end

Interface web para consultar os indicados e vencedores da categoria **Pior Filme** do Golden
Raspberry Awards.

A aplicação tem duas telas, acessíveis pelo menu lateral: um **Dashboard** com quatro painéis de
consulta e uma **Lista de filmes** paginada, com filtros por ano e por vencedor.

Os dados vêm da API pública da Outsera
([`https://challenge.outsera.tech/api/movies`](https://challenge.outsera.tech/swagger-ui/index.html)).
Este projeto não tem back-end próprio: apenas consome a API. Foi desenvolvido como teste técnico de
front-end.

## Stack

Versões declaradas no `package.json`:

| Pacote                                     | Versão               |
| ------------------------------------------ | -------------------- |
| Angular (`@angular/core` e demais pacotes) | `^22.1.0`            |
| Angular CLI / `@angular/build`             | `^22.1.8`            |
| TypeScript                                 | `~6.0.2`             |
| RxJS                                       | `~7.8.0`             |
| Bootstrap (apenas o CSS)                   | `^5.3.8`             |
| Vitest                                     | `^4.0.8`             |
| `@vitest/coverage-v8`                      | `^4.1.11`            |
| jsdom                                      | `^28.0.0`            |
| ESLint / angular-eslint                    | `^10.9.1` / `22.5.0` |
| Prettier                                   | `^3.8.1`             |

A aplicação é zoneless (sem `zone.js`), usa apenas standalone components e signals.

## Pré-requisitos e instalação

- Node.js 24, a versão do `.nvmrc`. Com o nvm, basta rodar `nvm use`. O campo `engines` aceita
  `^24.15.0`.
- npm 10 ou superior.

Todos os comandos rodam na pasta `app/`, onde está o `package.json`.

```bash
npm install
```

## Como rodar

Servidor de desenvolvimento, em `http://localhost:4200/`:

```bash
npm start
```

Build de produção, gerado em `dist/app/browser`:

```bash
npm run build
```

Build de produção servido localmente, em `http://localhost:3000/`:

```bash
npm run serve:prod
```

O script roda o `npm run build` e serve `dist/app/browser` com o pacote `serve`, baixado pelo
`npx` na primeira execução (não é dependência do projeto). O `-s` do `serve` redireciona rotas
desconhecidas para o `index.html`, o que permite abrir `/movies` direto.

## Como rodar os testes

Os testes unitários usam Vitest (runner padrão do Angular CLI) com jsdom. Nenhum teste faz
requisição de rede: o HTTP é simulado com `HttpTestingController`.

```bash
npm test                     # execução única
npm run test:watch           # modo watch
npm run test -- --coverage   # execução única com relatório de cobertura
```

Situação atual: 23 arquivos de teste e 155 testes, todos passando.

| Categoria  | Cobertura        | Threshold |
| ---------- | ---------------- | --------- |
| Statements | 99,59% (496/498) | 98%       |
| Branches   | 100% (235/235)   | 99%       |
| Functions  | 100% (103/103)   | 99%       |
| Lines      | 99,39% (327/329) | 98%       |

A única lacuna é `src/app/app.ts`, o componente raiz, que só renderiza o shell.

A cobertura é medida sobre todo o `src/` (TypeScript e templates), exceto `main.ts`,
`index.html`, os arquivos de environment, os helpers de teste em `src/testing/`, os `*.spec.ts` e
barrels (`index.ts`). Assim, um arquivo que nenhum teste importa também entra na conta.

Os thresholds ficam em `angular.json` (`coverageThresholds`), na parte inteira de cada número
menos um ponto. Com `--coverage`, se qualquer categoria cair abaixo do limite, o comando termina
com erro, mesmo com todos os testes passando. O relatório HTML é gerado em `coverage/app/`.

Lint e formatação:

```bash
npm run lint           # ESLint (angular-eslint)
npm run format:check   # verifica a formatação com Prettier
npm run format         # aplica a formatação
```

## Funcionalidades

### Menu

Header com o título "Frontend Angular Test" e sidebar com os links **Dashboard** e **List**. O
link da rota atual fica destacado. Abaixo de 768px a sidebar recolhe e é aberta por um botão no
header. A rota vazia redireciona para o dashboard, e rotas desconhecidas mostram uma página de
"não encontrado".

### Dashboard

Quatro painéis:

- **List years with multiple winners**: anos com mais de um vencedor e a quantidade de
  vencedores, na ordem devolvida pela API.
- **Top 3 studios with winners**: os três estúdios com mais vitórias.
- **Producers with longest and shortest interval between wins**: duas tabelas, "Maximum" e
  "Minimum", com todos os produtores empatados em cada uma.
- **List movie winners by year**: campo de busca por ano. A busca dispara pelo botão ou pelo
  Enter, e só com um ano de 4 dígitos; até lá o botão fica desabilitado. O painel começa vazio,
  com uma mensagem convidando a buscar, e nenhuma requisição é feita antes da primeira busca.

Cada painel tem seus próprios estados de carregamento, erro (com "Try again") e vazio.

### Lista de filmes

Tabela com ID, Year, Title e Winner?, 15 filmes por página. Os filtros ficam na segunda linha do
cabeçalho:

- **Filter by year**: aceita só dígitos, até 4. A requisição sai 400 ms depois da última tecla,
  e só com um ano completo; um valor incompleto é tratado como ausente.
- **Winner?**: "Yes/No" (todos), "Yes" ou "No".

Trocar qualquer filtro volta para a primeira página. A paginação tem botões de primeira,
anterior, próxima e última página, e uma janela de até cinco páginas numeradas. A mensagem de
lista vazia distingue "nenhum filme" de "nenhum filme para os filtros aplicados".

## Arquitetura

```
src/
  app/
    app.ts, app.config.ts, app.routes.ts   # raiz, providers e rotas (lazy loading com loadComponent)
    core/
      api/            # MovieApiService, models tipados e o token API_BASE_URL
      interceptors/   # interceptor de erro HTTP e o tipo AppHttpError
      layout/         # shell: header, sidebar e router-outlet
    shared/
      ui/             # panel, data-table, pagination, loading-indicator, error-state, empty-state
      utils/          # funções puras: topStudios, toApiPage, normalizeWinners, parseYear...
    features/
      dashboard/
        dashboard.page.ts   # só posiciona os painéis no grid
        panels/             # multiple-winners, top-studios, producer-intervals, winners-by-year
      movies/
        movies-list.page.ts
      not-found/
  environments/       # URL base da API por ambiente
  testing/            # helpers compartilhados pelos specs (HTTP de teste, fixtures, consultas à tabela)
```

- **Organização por feature.** Cada tela fica em `features/`. O que é compartilhado vai para
  `shared/` (UI e funções puras) ou `core/` (acesso à API, interceptor e layout).
- **Containers e componentes apresentacionais.** Os painéis e a página da lista são containers:
  injetam o serviço e buscam dados. Os componentes de `shared/ui` só recebem `input()` e emitem
  `output()`; nenhum injeta serviço ou conhece a API.
- **Lógica derivada em funções puras.** Top 3, conversão de página, normalização de
  `/winnersByYear`, validação do ano e conversão do filme para a linha da tabela ficam em
  `shared/utils/`, testadas sem TestBed.
- **Painéis autônomos.** Cada painel tem seu próprio `rxResource` e seus estados de carregamento,
  erro e vazio. A página do dashboard não injeta serviço nem busca dados.
- **`MovieApiService` e `rxResource`.** O serviço é um wrapper puro do `HttpClient`: monta URL e
  parâmetros, desembrulha as respostas e devolve `Observable`, sem signals e sem estado. As
  features envolvem esses métodos com `rxResource`, que expõe `value()`, `isLoading()`, `error()`
  e `reload()` e cancela a requisição anterior quando os parâmetros mudam.
- **URL base injetada.** A URL da API vem do `environment` pelo `InjectionToken` `API_BASE_URL`,
  nunca escrita nos serviços. Os testes usam uma URL própria.

## Decisões técnicas

### `rxResource` nas features em vez de `httpResource`

**Problema.** O `httpResource` recebe a URL diretamente e precisa ser criado em contexto de
injeção. Usá-lo levaria a montagem de URL e query params para dentro dos componentes.

**Escolha.** O `MovieApiService` concentra URL e parâmetros e devolve `Observable`. As features
usam `rxResource`, cujo `stream` chama o serviço.

**Justificativa.** A montagem da requisição fica num só lugar, testável de forma isolada com
`HttpTestingController`. Os componentes mantêm a ergonomia de signals (`value()`, `isLoading()`,
`error()`) e o cancelamento automático da requisição anterior, sem gerenciar subscriptions. Os dois
são estáveis no Angular 22.

### Sem gerenciador de estado global

**Problema.** Onde guardar o estado da aplicação.

**Escolha.** Nenhum NgRx ou similar. O estado vive em signals dentro de cada container.

**Justificativa.** Nada é compartilhado entre as telas. Cada painel busca os próprios dados, e o
estado da lista se resume a três signals: ano, vencedor e página. O serviço de API não guarda
estado. Actions, reducers e selectors não teriam o que coordenar.

### TypeScript strict e `strictTemplates`

**Problema.** Erros de tipo em templates só aparecem em tempo de execução sem checagem estrita.

**Escolha.** `strict: true` no `tsconfig.json` e `strictTemplates: true` no
`angularCompilerOptions`. O ESLint proíbe `any` (`no-explicit-any`) e asserções de tipo
(`consistent-type-assertions` com `assertionStyle: 'never'`).

**Justificativa.** O compilador valida os bindings dos templates. Um exemplo é a
`DataTableComponent<T>`: o tipo `T` é inferido de `[rows]` e `[columns]`, e colunas com chaves que
não existem na linha não compilam.

### Bootstrap apenas CSS

**Problema.** Reproduzir o layout dos anexos sem trazer uma biblioteca de componentes.

**Escolha.** O `styles.scss` importa só `bootstrap/dist/css/bootstrap.min`. Sem ng-bootstrap, sem
Angular Material e sem o JavaScript do Bootstrap. Os componentes interativos (paginação, sidebar
recolhível) são do próprio projeto, e o ícone da busca é um SVG inline.

**Justificativa.** O projeto só precisa de grid, tabela, formulário e utilitários. Nenhum código
JavaScript de UI de terceiros entra no bundle. Em contrapartida, o CSS do Bootstrap é importado por
inteiro: é o maior arquivo do bundle inicial, com 230,87 kB de 502,02 kB (22,61 kB de 98,52 kB
transferidos, comprimido). O total passou do limite padrão de aviso do Angular (500 kB), então o
`maximumWarning` do budget `initial` no `angular.json` subiu para 700 kB. O `maximumError`
continua em 1 MB.

### Top 3 de estúdios no front-end, com desempate alfabético

**Problema.** `/studiosWithWinCount` devolve todos os estúdios, sem ordem garantida.

**Escolha.** A função pura `topStudios` (`shared/utils/studios.ts`) copia o array, ordena por
`winCount` decrescente, desempata por nome (`localeCompare` com locale `en`) e pega os três
primeiros. O painel aplica a função no `stream` do `rxResource`.

**Justificativa.** Sem desempate, estúdios empatados no terceiro lugar poderiam aparecer em ordem
diferente a cada resposta. Com ele, o resultado é determinístico e testável. A consequência é que,
num empate no terceiro lugar, os estúdios que ficam depois na ordem alfabética não aparecem.

### Empates em `min` e `max`

**Problema.** `min` e `max` são arrays e podem ter mais de um produtor empatado, inclusive o mesmo
produtor duas vezes.

**Escolha.** As duas tabelas renderizam todos os registros, na ordem da API. O `trackBy` combina
`producer` e `previousWin`. Se um dos arrays vier vazio, só a tabela correspondente mostra o
estado vazio.

**Justificativa.** Mostrar só o primeiro registro esconderia produtores com o mesmo intervalo. O
`trackBy` só pelo nome duplicaria a chave quando o mesmo produtor aparece duas vezes.

### Normalização de `/winnersByYear`

**Problema.** O OpenAPI e a API real devolvem um array, mas o exemplo do PDF do teste mostra um
objeto único. Um corpo vazio chega como `null` pelo `HttpClient`.

**Escolha.** `normalizeWinners` (`shared/utils/winners.ts`) aceita as três formas e sempre
devolve `Movie[]`. O `MovieApiService` aplica a função, e o painel recebe só a lista.

**Justificativa.** O componente não trata variações de formato, e a regra fica testada num único
lugar.

### `winner: false` é enviado; filtro vazio não

**Problema.** `false` é falsy. Uma checagem do tipo `if (query.winner)` descartaria o filtro "No".

**Escolha.** No `MovieApiService`, `year` e `winner` só entram no `HttpParams` quando
`!== undefined`. Na lista, "Yes/No" vira `undefined` e "No" vira `false`. Um ano incompleto também
vira `undefined`.

**Justificativa.** "Todos" é a ausência do parâmetro, não um valor. Os testes do serviço e da
lista conferem tanto `winner=false` na query string quanto a ausência de `winner` e `year`.

### Estados de loading, erro e vazio por painel

**Problema.** Um único loading global faria uma falha em um endpoint derrubar o dashboard inteiro.

**Escolha.** Cada painel encadeia no próprio template `isLoading()` → `error()` → tabela. O erro
mostra a mensagem do `AppHttpError` produzido pelo interceptor e um "Try again" que chama
`reload()`. O interceptor classifica a falha em rede, 4xx, 5xx ou desconhecida, sem retry e sem
engolir o erro.

**Justificativa.** Os painéis são independentes na API e passam a ser independentes na tela. Um
teste do dashboard derruba cada endpoint e confere que os outros painéis continuam renderizando.

### Reset de página ao trocar filtro

**Problema.** Na página 3, aplicar um filtro com menos resultados pode apontar para uma página que
não existe.

**Escolha.** `currentPage` é um `linkedSignal` que tem os filtros efetivos como fonte: qualquer
mudança de filtro volta a página para 1. O `computed` dos filtros compara ano e vencedor campo a
campo, então digitar "1", "19", "198" não conta como mudança.

**Justificativa.** O reset acontece na mesma propagação da mudança de filtro. Sai uma única
requisição, já com `page=0`, sem uma requisição intermediária com a página antiga.

### Estado da lista nos query params: fora do escopo

**Problema.** Filtros e página da lista vivem só em memória. Um F5 volta para a primeira página
sem filtros, e não é possível compartilhar um link para uma consulta.

**Escolha.** A sincronização com os query params da rota (`/movies?year=1986&winner=true&page=2`)
foi considerada, analisada e deixada fora do escopo.

**Justificativa.** Não é requisito do teste técnico. O benefício seria um link compartilhável, o
estado preservado no F5 e a navegação de voltar e avançar do navegador passando pelas consultas.

### Sem CI

**Problema.** Garantir que lint, testes e build continuem passando.

**Escolha.** Não há pipeline de CI (GitHub Actions ou outro) nem git hooks. O Husky e o
lint-staged chegaram a ser configurados e foram removidos, para manter o tooling consistente com o
projeto de back-end desta avaliação.

**Justificativa.** `npm run lint`, `npm test` e `npm run build` foram rodados localmente ao fim de
cada etapa, como registrado em `docs/ai-log.md`. Um pipeline rodando os mesmos comandos, mais o
threshold de cobertura, é o passo natural se o projeto continuar.

## Limitações conhecidas

- **Estado da lista não sobrevive ao F5.** Filtros e página não vão para a URL (ver "Decisões
  técnicas").
- **Sem CI.** As verificações dependem de serem rodadas localmente.
- **Mensagens de erro genéricas.** O OpenAPI documenta o erro como `{ status, timestamp, message }`,
  mas a API real devolve `ProblemDetail` (`{ type, title, status, detail, instance }`). Por isso o
  interceptor ignora o corpo do erro e mostra uma mensagem por tipo de falha, sem o detalhe
  devolvido pela API.
- **Bundle inicial acima de 500 kB.** Consequência de importar o CSS do Bootstrap inteiro; o
  budget de aviso foi elevado para 700 kB.
- **Top 3 com empate.** Num empate no terceiro lugar, só o primeiro em ordem alfabética aparece.
- **Responsividade verificada manualmente.** O layout em 768x1280 e 360x800 foi conferido no
  Chrome headless durante o desenvolvimento. Os testes unitários só verificam as classes do grid e
  da tabela, e não há testes end-to-end.
- **Envio implícito do formulário não testado no jsdom.** O jsdom não implementa o submit pelo
  Enter; o teste usa `form.requestSubmit()`. O Enter real foi conferido no Chrome.

## Uso de ferramentas de IA

O projeto foi desenvolvido com o Claude Code, seguindo este processo:

- **Instruções persistentes no `CLAUDE.md`.** Stack, contrato da API, regras de negócio,
  arquitetura, convenções e critérios de teste ficam nesse arquivo, lido pelo agente antes de cada
  tarefa.
- **Desenvolvimento em etapas.** Cada etapa teve um prompt com escopo fechado e critérios de
  aceite: fundação, camada de dados, componentes de UI, painéis, busca por ano, lista, auditoria
  de testes e documentação. Entre uma etapa e outra houve revisão humana.
- **Registro em `docs/ai-log.md`.** Cada entrada traz o prompt integral, o resultado relatado pelo
  agente e os ajustes manuais feitos na revisão.

Todo o código foi revisado. O log registra os pontos em que sugestões do agente foram corrigidas
ou rejeitadas. Alguns exemplos: a mensagem própria para 404 foi removida; a busca por ano passou a
usar um `<form>` com `ngSubmit` no lugar do `keydown.enter`; a limpeza do campo de ano, duplicada
em dois componentes, virou a função `toYearDigits`; e `toPaginationState`, criada sem uso em
produção, foi removida. O log também registra a troca de `httpResource` por `rxResource` feita no
`CLAUDE.md`.
