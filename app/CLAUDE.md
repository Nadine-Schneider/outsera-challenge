# CLAUDE.md

Instruções persistentes para o agente de IA neste repositório. Leia este arquivo antes de qualquer tarefa.

## Visão geral

Interface web que permite consultar a lista de indicados e vencedores da categoria "Pior Filme" do
Golden Raspberry Awards. Os dados vêm de uma API REST pública já existente; **este projeto não tem
back-end**, apenas consome a API.

A aplicação tem duas telas, acessíveis por um menu lateral:

1. **Dashboard**, com quatro painéis independentes.
2. **Lista de filmes**, com paginação no servidor e dois filtros.

Este é um teste técnico. O código será avaliado como numa revisão de código tradicional: legibilidade,
organização, boas práticas, tratamento de estados e qualidade dos testes. O escopo funcional é pequeno,
então o diferencial está nos detalhes, não no volume de código.

## Stack

- Angular 22 (standalone components, signals, zoneless, `OnPush` por padrão), TypeScript em modo strict
- Roteamento com lazy loading via `loadComponent`
- `provideHttpClient` + `rxResource` para consumo da API (estável no v22)
- Bootstrap 5 **apenas o CSS**, para reproduzir o layout dos anexos; sem ng-bootstrap e sem Angular Material
- Vitest (runner padrão do Angular CLI) + `HttpTestingController` para os testes
- ESLint (angular-eslint) + Prettier 

## Comandos

```bash
npm install        # instalar dependências
npm start          # servidor de desenvolvimento
npm run build      # build de produção
npm run lint       # lint
npm test           # testes (Vitest)
npm run test -- --coverage   # testes com cobertura
```

## Requisitos obrigatórios (não negociáveis)

1. Duas views (Dashboard e Lista de filmes) e um menu com links para ambas.
2. Dashboard com quatro painéis, conforme o anexo 1:
   - anos com mais de um vencedor;
   - **três** estúdios com mais vitórias;
   - produtores com maior e menor intervalo entre vitórias (duas tabelas: Maximum e Minimum);
   - vencedores de um ano específico, buscado por um campo de texto.
3. Lista de filmes com paginação e filtros por ano e por vencedor, conforme o anexo 2.
4. Testes unitários de todas as funcionalidades.
5. Responsividade mínima de 768x1280 (tablet em retrato).
6. README com instruções para rodar o projeto e os testes.
7. Registro das interações com IA em `docs/ai-log.md`.

## Contrato da API

Base: `https://challenge.outsera.tech/api/movies`

A documentação oficial está em `https://challenge.outsera.tech/v3/api-docs` (OpenAPI) e
`https://challenge.outsera.tech/swagger-ui/index.html`. **O OpenAPI é a fonte da verdade**: o PDF do teste
tem erros de digitação no JSON de exemplo. Antes de criar ou alterar qualquer model, confira os paths,
os nomes dos campos e os tipos no OpenAPI, e me avise se algo divergir do que está escrito aqui.

| Uso                           | Requisição                                       | Retorno                                                                               |
| ----------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------- |
| Lista paginada                | `GET /?page={n}&size={n}&winner={bool}&year={n}` | página no formato Spring (`content`, `totalPages`, `totalElements`, `number`, `size`) |
| Anos com múltiplos vencedores | `GET /yearsWithMultipleWinners`                  | `{ years: [{ year, winnerCount }] }`                                                  |
| Estúdios                      | `GET /studiosWithWinCount`                       | `{ studios: [{ name, winCount }] }`                                                   |
| Intervalo de prêmios          | `GET /maxMinWinIntervalForProducers`             | `{ min: [...], max: [...] }`                                                          |
| Vencedores por ano            | `GET /winnersByYear?year={n}`                    | lista de filmes                                                                       |

Filme: `{ id, year, title, studios: string[], producers: string[], winner: boolean }`.
Intervalo: `{ producer, interval, previousWin, followingWin }`.

### Regras de negócio e armadilhas

- **Top 3 estúdios.** O endpoint devolve **todos** os estúdios, sem ordem garantida. Ordenar por `winCount`
  decrescente e pegar os três primeiros é responsabilidade do front-end. Em caso de empate no terceiro
  lugar, desempate por nome (ordem alfabética) para o resultado ser determinístico.
- **`min` e `max` são arrays** e podem ter mais de um produtor empatado. Renderize todos, nunca só o primeiro.
- **`/winnersByYear`** pode retornar mais de um filme (1986, 1990 e 2015 têm dois vencedores cada). Normalize
  a resposta na camada de serviço para sempre expor `Movie[]` ao componente, mesmo que a API devolva um
  objeto único.
- **Paginação.** A API usa `page` começando em **0**; a UI mostra a página **1**. A conversão fica numa única
  função utilitária, nunca espalhada pelos componentes.
- **Mudança de filtro reseta a página para a primeira.** Erro clássico; não deixe passar.
- **Filtro de vencedor tem três estados**: todos, sim e não. "Todos" significa **não enviar** o parâmetro
  `winner` na query string. O mesmo vale para o ano vazio.
- **Filtro por ano** aplica debounce de 400 ms e só dispara com um valor numérico válido (4 dígitos).
  Nunca dispare requisição a cada tecla.
- **Busca por ano no dashboard** não dispara nada enquanto o campo estiver vazio ou inválido; o painel começa
  no estado vazio, não em loading.

## Arquitetura

Organização por feature, com separação entre componentes _container_ (buscam dados) e componentes
_apresentacionais_ (recebem `input()` e apenas renderizam). Camadas simples; não crie abstrações antes de
serem necessárias.

```
src/app/
  core/
    api/            # MovieApiService, models tipados, token com a URL base
    interceptors/   # tratamento global de erro HTTP
    layout/         # shell: header + sidebar + router-outlet
  shared/
    ui/             # data-table, pagination, panel, loading, error-state, empty-state
    utils/          # funções puras (topStudios, toApiPage, normalizeWinners…)
  features/
    dashboard/
      dashboard.page.ts
      panels/       # multiple-winners, top-studios, producer-intervals, winners-by-year
    movies/
      movies-list.page.ts
      movie-filters/
  app.routes.ts     # '' redireciona para dashboard; as duas features com loadComponent
  app.config.ts
```

- **A URL base da API fica num `InjectionToken`** (ou em `environment`), nunca hardcoded nos serviços.
  Isso mantém os testes independentes de rede.
- **Cada painel do dashboard é autônomo**, com seu próprio loading, erro e estado vazio. Se um endpoint
  falhar, os outros três continuam funcionando. Nada de um único loading global cobrindo o dashboard.
- **Toda lógica derivada vive em funções puras** em `shared/utils`, fora dos componentes: ordenação do
  top 3, conversão de página, normalização de resposta.
- **Consumo de dados com `rxResource`** nas features, cuja `stream` chama o `MovieApiService`
  a partir dos signals de filtro e página. Isso dá `value()`, `isLoading()`, `error()` e
  cancelamento automático da requisição anterior sem gerenciar subscription na mão. O
  `MovieApiService` permanece um wrapper puro do `HttpClient`, sem conhecer signals.
  Quando a função reativa retorna `undefined`, nenhuma requisição é feita — use isso para o
  painel de busca por ano.
- **Os filtros e a página da lista são sincronizados com os query params** da rota
  (`/movies?year=1986&winner=true&page=2`), para que o link seja compartilhável e o F5 preserve o estado.
  A rota é a fonte da verdade do estado da lista.
- **Debounce com interop RxJS**: `toSignal(toObservable(signal).pipe(debounceTime(400)))`. Não reinvente
  debounce com `setTimeout`.
- **Responsividade**: grid do dashboard com duas colunas em telas largas e uma coluna abaixo de 992px;
  tabelas com `overflow-x: auto`; sidebar recolhível abaixo de 768px. O alvo mínimo a verificar é 768x1280.

## Convenções de código

- Identificadores, nomes de arquivos e mensagens de commit em inglês; documentação (README, docs) em
  português; **textos da interface em inglês**, seguindo os rótulos dos anexos
  ("List years with multiple winners", "Top 3 studios with winners", "List movies", "Winner?").
- Sem `any` e sem `as` para contornar tipagem. Tipos explícitos nos contratos públicos.
- Nada de `@Input()`/`@Output()` decorators: use as funções `input()`, `output()` e `model()`.
- Nada de `*ngIf`/`*ngFor`: use o control flow nativo (`@if`, `@for` com `track`, `@switch`).
- `inject()` no lugar de injeção por construtor.
- Nada de `NgModule`: apenas standalone components.
- Sem gerenciador de estado global (NgRx, NgXs). O escopo não justifica; signals e serviços bastam.
- Não adicione bibliotecas fora da stack acima sem me perguntar antes.
- Commits no padrão Conventional Commits (`feat:`, `fix:`, `chore:`, `test:`, `docs:`, `style:`).

## Testes

- Testes unitários com Vitest, colocados ao lado do arquivo testado (`*.spec.ts`).
- **Nenhum teste pode fazer requisição de rede real.** Use `provideHttpClientTesting` e
  `HttpTestingController` para verificar URL e query params, inclusive a **ausência** de parâmetros
  quando o filtro está em "todos".
- Teste comportamento observável pelo DOM, não detalhes internos de implementação.
- Cobertura mínima que cada funcionalidade precisa ter:
  - serviço de API: montagem correta da URL e dos parâmetros de cada endpoint;
  - funções puras: top 3 com empate, normalização de `winnersByYear`, conversão de página;
  - cada painel: renderiza dados, mostra erro e mostra estado vazio;
  - busca por ano: não dispara com valor inválido, dispara com valor válido;
  - lista: trocar filtro reseta para a primeira página; paginação navega; debounce funciona
    (use fake timers, não `setTimeout` real no teste);
  - layout: o menu tem os links para as duas rotas.
- Todo teste precisa ser determinístico. Sem depender de ordem de execução ou de tempo real.

## Como trabalhar neste repositório

- Execute somente o escopo da tarefa pedida. Não antecipe etapas futuras.
- Antes de concluir, rode `npm run lint`, `npm test` e `npm run build`, e corrija o que falhar.
  Não relate uma tarefa como concluída sem ter executado os comandos de fato.
- Ao final de cada tarefa, informe: arquivos criados ou alterados, comandos executados e decisões que
  devem ser revisadas por mim.
- Adicione uma entrada em `docs/ai-log.md` com a tarefa. Não escreva a seção "Ajustes manuais";
  ela é preenchida por mim.
