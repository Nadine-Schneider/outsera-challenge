# Registro de interações com IA

Histórico das interações com assistentes de IA durante o desenvolvimento deste projeto.

Cada entrada segue a estrutura abaixo:

- **Data** — quando a interação aconteceu.
- **Ferramenta** — assistente e modelo utilizados.
- **Prompt (resumo)** — o que foi pedido, de forma resumida.
- **Resultado** — o que a IA produziu.
- **Ajustes manuais** — correções e mudanças feitas por mim depois, à mão.

---

## 2026-09-22 — Configuração inicial do projeto

**Ferramenta:** Claude Code (Opus 5)

**Prompt (resumo):** Gerar a fundação do projeto com o Nest CLI no diretório atual (npm, sem
inicializar git, preservando `CLAUDE.md` e `data/`); criar `.nvmrc` com a LTS atual do Node e
`engines` no `package.json`; instalar as dependências da stack; configurar `ConfigModule`
global com configuração tipada e validação de `MOVIELIST_CSV_PATH` e `PORT`, `DatabaseModule`
com TypeORM + `better-sqlite3` em memória, `ValidationPipe` global e Swagger em `/api-docs`;
criar os módulos vazios `MoviesModule`, `ProducersModule` e `CsvImportModule`; remover
`AppController`, `AppService` e o teste unitário de exemplo, deixando apenas a suíte e2e;
criar o teste de fumaça, `.gitignore`, `.editorconfig`, o README inicial e este log. Sem
entidades, importação de CSV ou endpoints de negócio nesta etapa.

**Resultado:**

- Projeto gerado com `@nestjs/cli@11` (`--strict`, `--skip-git`, `--package-manager npm`) em
  um diretório temporário e copiado para cá, para não arriscar o `CLAUDE.md` e o `data/`.
- `.nvmrc` com `24` (Krypton, LTS atual) e `engines` exigindo Node >= 24 e npm >= 10.
- Dependências instaladas: `@nestjs/config`, `@nestjs/typeorm`, `typeorm`, `better-sqlite3`,
  `csv-parse`, `class-validator`, `class-transformer`, `@nestjs/swagger`. Todas fixadas em
  majors compatíveis com o Nest 11.
- `src/config/`: `EnvironmentVariables` (class-validator) + `validateEnvironment`,
  `AppConfigService` com getters tipados e `AppConfigModule` global.
- `src/database/database.module.ts`: `TypeOrmModule.forRoot` com `better-sqlite3`,
  `database: ':memory:'`, `autoLoadEntities` e `synchronize`, com comentário justificando o
  `synchronize` em banco efêmero.
- `src/app.setup.ts`: `configureApp()` aplica o `ValidationPipe` global (`whitelist`,
  `forbidNonWhitelisted`, `transform`) e registra o Swagger em `/api-docs`. Fica fora do
  grafo de módulos para que `main.ts` e os testes e2e exercitem a mesma aplicação.
- Módulos vazios `MoviesModule`, `ProducersModule` e `CsvImportModule` registrados no
  `AppModule`; pastas `test/fixtures/` e `docs/` criadas.
- `AppController`, `AppService` e `app.controller.spec.ts` removidos; bloco `jest` do
  `package.json` e scripts de teste unitário removidos, restando `test:e2e` (e `test` como
  alias).
- `test/app.e2e-spec.ts`: teste de fumaça que sobe o `AppModule` completo e verifica
  `/api-docs` (200, HTML do Swagger UI) e `/api-docs-json` (200, título e versão).
- `tsconfig.json` com `strict: true`; `.gitignore` e `.editorconfig` criados; ESLint e
  Prettier mantidos no padrão do Nest.
- `README.md` inicial com descrição, pré-requisitos, instalação, execução, testes, variáveis
  de ambiente e as seções "Endpoints" e "Decisões técnicas" vazias.
- Verificações: `npm run build`, `npm run lint` e `npm run test:e2e` passaram; a aplicação
  subiu via `node dist/main.js` e `/api-docs` respondeu 200. A função de validação de
  ambiente foi exercitada à parte (defaults aplicados, `PORT` inválida e
  `MOVIELIST_CSV_PATH` vazio rejeitados).

**Ajustes manuais:**

- Foram fixados os pacotes do núcleo do NestJS (`@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express` e `@nestjs/testing`) na faixa `~11.2.5`, no lugar da faixa anterior `^11.0.1`. Isso garante correções de segurança, entre elas a CVE-2026-35515 (injeção em SSE) e a CVE-2026-40879 (DoS no transporte TCP), e aceita apenas atualizações de patch. O projeto permanece no Nest 11 por uma restrição de tooling: o CLI 12 adota ESM, Vitest e oxlint, o que conflita com a stack definida neste projeto (Jest, Supertest e TypeScript CommonJS). Também foi adicionado ao `package.json` um `overrides` que força `multer` para `^2.3.0`. O `@nestjs/platform-express` 11.x embute o multer 2.2.0, que é afetado por quatro vulnerabilidades de alta severidade: GHSA-wc9g-mqfw-jrwm, GHSA-qfvm-cv95-jqjf, GHSA-qvfw-j98x-7q72 e GHSA-535w-7cp7-47q4. O override não deve ser removido enquanto o projeto estiver no Nest 11. Ele só poderá sair em uma futura migração para o Nest 12, que já inclui um multer corrigido.
- No `tsconfig.json` foram declarados explicitamente os tipos globais com `"types": ["node", "jest"]` e removido o `"baseUrl": "./"` herdado do template do Nest CLI. O motivo é a divergência entre o TypeScript que compila o projeto (5.9.3, o do `package.json`) e o que o editor usa (6.0.3, embutido no VS Code). Sem a declaração, o editor montava a aplicação sem `@types/jest` nem `@types/node` e acusava `Cannot find name 'describe'` no teste e2e, enquanto `npm run build` e `npm run test:e2e` passavam normalmente. O `baseUrl` saiu porque o TypeScript 6.0 já o sinaliza como descontinuado.

---

## 2026-09-22 — Modelo de dados e importação do CSV

**Ferramenta:** Claude Code (Opus 5.5)

**Prompt:**

```markdown
Leia o CLAUDE.md antes de começar.

# Tarefa: modelo de dados e importação do CSV

## 1. Entidades (src/movies/entities)

- `Movie`: id (PK gerado), year (int), title (string), winner (boolean, default false).
- `Producer`: id (PK gerado), name (string, único).
- `Studio`: id (PK gerado), name (string, único).
- Relações N:N `movie_producers` e `movie_studios`, com nomes de tabela e colunas explícitos.
- Índices em `movies.winner` e `movies.year`.

## 2. Parser de nomes (src/csv-import)

Função pura que recebe o conteúdo bruto de `producers` ou `studios` e devolve a lista de nomes:

- separa por `, and`, `,` e `and` (cobrindo "A, B, and C", "A, B and C", "A and B");
- aplica trim, normaliza espaços internos repetidos, descarta strings vazias e remove duplicados
  preservando a ordem de aparição;
- não deve quebrar nomes que apenas contenham a sequência "and" dentro de uma palavra
  (ex.: "Andrew Bergman", "Alexander").

## 3. Serviço de importação (src/csv-import)

- Executa no bootstrap da aplicação, via `OnApplicationBootstrap`.
- Lê o arquivo indicado por `MOVIELIST_CSV_PATH` usando `csv-parse`, com as colunas mapeadas pelo
  cabeçalho, tratando BOM, CRLF, espaços em volta dos valores e linhas em branco.
- `winner` é verdadeiro quando o valor, após trim e sem diferenciar maiúsculas, é `yes`; qualquer
  outro valor (inclusive vazio) é falso.
- Reaproveita `Producer` e `Studio` já existentes pelo nome, em vez de duplicar registros.
- Roda dentro de uma transação, com inserts em lote (não um insert por linha).
- Falha a inicialização com mensagem clara se o arquivo não existir ou se faltar alguma coluna
  obrigatória do cabeçalho.
- Ignora, com log de warning contendo o número da linha, registros com ano ausente ou não numérico
  ou com título vazio.
- Ao final, loga um resumo: quantidade de filmes, produtores e estúdios importados.

## 4. Teste de integração (test/csv-import.e2e-spec.ts)

Sobe o AppModule completo e, consultando o `DataSource`, verifica:

- com `data/Movielist.csv`: 206 filmes, 42 vencedores, 359 produtores e 59 estúdios;
- que "Andrew Bergman" e "Mike Lobell" existem como produtores separados, e que não existe nenhum
  produtor cujo nome contenha " and ";
- com uma fixture em `test/fixtures` cobrindo formatos de separador e variações de `winner`
  (`Yes`, `yes `, vazio): os nomes e o flag de vencedor são interpretados corretamente;
- com uma fixture contendo uma linha inválida: a aplicação sobe e importa apenas as linhas válidas;
- que um `MOVIELIST_CSV_PATH` inexistente impede a inicialização, com erro claro.

Mantenha o teste de fumaça existente passando.

# Critérios de aceite

- `npm run build`, `npm run lint` e `npm run test:e2e` passam sem erros.
- `npm run start:dev` sobe a aplicação e loga o resumo da importação.
- Nenhum `*.spec.ts` foi criado em `src/`.
```

**Resultado:**

- `src/movies/entities/`: entidades com nomes explícitos de tabelas, colunas de junção
  (`movie_id`, `producer_id`, `studio_id`) e índices (`idx_movies_year`,
  `idx_movies_winner`); `name` único em `producers` e `studios`. `MoviesModule` registra as
  entidades com `TypeOrmModule.forFeature`.
- `src/csv-import/name-list.parser.ts`: `parseNameList()` separa por `, and`, `,` e `and`
  (o "and" precisa ser palavra isolada, então "Andrew Bergman" e "Alexander" ficam intactos),
  normaliza espaços, descarta vazios e remove duplicados preservando a ordem.
- `src/csv-import/csv-import.service.ts`: lê o arquivo com `csv-parse/sync` (`bom`, `trim`,
  `skip_empty_lines`, `skip_records_with_empty_values`, `relax_column_count`), mapeia as
  colunas pelo cabeçalho (sem diferenciar maiúsculas) e valida as obrigatórias; ignora com
  warning (número da linha) ano ausente/não numérico e título vazio; persiste tudo numa
  transação em lotes de 500 linhas, reaproveitando produtores e estúdios existentes via
  `INSERT OR IGNORE` + leitura dos ids; loga o resumo da importação.
- Como o driver SQLite do TypeORM não devolve os ids de um INSERT com várias linhas, os ids
  dos filmes são lidos de volta em ordem (`id > último id anterior`), com verificação da
  quantidade.
- `test/csv-import.e2e-spec.ts` + `test/utils/create-test-app.ts`: cada cenário sobe o
  `AppModule` completo com seu `MOVIELIST_CSV_PATH`. Como o `ConfigModule` valida o ambiente
  uma única vez, ao ser carregado, o helper carrega a aplicação num registro de módulos
  isolado (`jest.isolateModules` + `jest.requireActual`).
- Fixtures: `name-formats.csv` (BOM, CRLF, cabeçalho fora de ordem e com espaços, linhas em
  branco, separadores variados, `Yes`/`yes `/vazio/`no`/`YES`), `invalid-rows.csv` e
  `missing-column.csv`. `.gitattributes` marca `test/fixtures/*.csv` como `-text` para o git
  não converter as quebras de linha.
- Verificações: `npm run build`, `npm run lint` e `npm run test:e2e` (9 testes) passaram; a
  aplicação subiu com `data/Movielist.csv` e logou 206 filmes (42 vencedores), 359 produtores
  e 59 estúdios.

**Ajustes manuais:**

- O separador `and` do parser de nomes (`src/csv-import/name-list.parser.ts`) passou a ignorar
  maiúsculas e minúsculas: `and`, `AND`, `And`, `aNd` e qualquer outra variação separam nomes,
  tanto isolados (`A AND B`) quanto após vírgula (`A, B, And C`). Antes, só o `and` minúsculo
  separava, e um valor como `Producer G AND Producer H` virava um único produtor. O "and"
  continua precisando ser uma palavra isolada entre espaços, então nomes como "Andrew
  Bergman", "Andy Sandler" e "Brandon Anderson" seguem intactos. A fixture
  `test/fixtures/name-formats.csv` ganhou uma linha com essas variações, coberta pelo teste
  `test/csv-import.e2e-spec.ts`.
- `testTimeout` da suíte e2e (`test/jest-e2e.json`) elevado de 5 s (padrão do Jest) para
  30 s. Cada cenário carrega o `AppModule` completo num registro de módulos isolado e, com o
  cache do ts-jest frio, o `beforeAll` chegou a passar de 5 s, derrubando os testes do
  cenário.
- Registros duplicados no CSV passaram a ser descartados na importação
  (`src/csv-import/csv-import.service.ts`). Uma linha é duplicada quando tem o mesmo `year`,
  `title`, `studios` e `producers` de uma linha anterior; só a primeira ocorrência é gravada
  e as demais são ignoradas com warning (`Skipping line N: duplicate of line M.`). A
  comparação é feita depois do parse: título e nomes com trim e espaços normalizados, e as
  listas de estúdios e produtores comparadas como conjuntos, sem importar a ordem ("A and B"
  equivale a "B, A"). O `winner` não faz parte da chave, então uma repetição com outro valor
  de `winner` também é descartada e vale o da primeira linha. Sem isso, uma linha repetida de
  um filme vencedor contaria duas vitórias no mesmo ano para cada produtor e geraria um
  intervalo 0 falso. A fixture `test/fixtures/duplicate-rows.csv` cobre duplicados com ordem
  e espaços diferentes e com `winner` diferente, além de linhas que diferem só no ano, só no
  título, só no estúdio ou só nos produtores (essas são mantidas).
- Os ids dos filmes passaram a ser atribuídos pela aplicação (`saveMovies` em
  `src/csv-import/csv-import.service.ts`). Como o driver SQLite do TypeORM não devolve os ids
  de um INSERT com várias linhas, a versão anterior gravava os filmes e lia os ids de volta
  (`id > maior id anterior`, em ordem de id), associando-os pela posição na lista. Isso
  dependia de o SQLite numerar as linhas na ordem do `VALUES`. Agora, dentro da transação, a
  aplicação lê o maior id existente, atribui `maior id + 1`, `+ 2`, ... a cada filme, envia
  esses ids no INSERT em lote e usa os mesmos valores para montar `movie_producers` e
  `movie_studios`. O banco não escolhe nenhum id e a consulta de leitura de volta deixou de
  existir; se algum id já estiver ocupado, o INSERT falha por chave primária e a transação
  inteira é desfeita, em vez de gravar vínculos errados em silêncio. A entidade continua com
  `@PrimaryGeneratedColumn`, e o TypeORM envia o id explícito no INSERT para o SQLite. O
  teste `test/csv-import.e2e-spec.ts` ganhou o cenário "with more movies than a single insert
  batch": 1.201 filmes (três lotes de 500), gerados num CSV temporário, com verificação de ids
  sequenciais na ordem do arquivo e dos produtores e estúdios de cada filme. Invertendo os
  ids devolvidos por `saveMovies`, 4 testes falham, o que confirma que desalinhamentos são
  detectados.

---

## 2026-09-22 — Reorganização das entidades por módulo

**Ferramenta:** Claude Code (Opus 5.5)

**Prompt:**

```markdown
Leia o CLAUDE.md antes de começar.

# Tarefa: refatorar a organização das entidades

A entidade `Producer` está em `src/movies/entities`, mas o caso de uso dela (o endpoint de intervalos
de prêmios) pertence ao módulo `producers`. Mova a entidade para o módulo dono do seu caso de uso.

1. Mova `producer.entity.ts` para `src/producers/entities/` e atualize todos os imports.
2. `Movie` e `Studio` permanecem em `src/movies/entities/`. `Studio` não ganha módulo próprio porque
   não tem caso de uso nem endpoint; registre essa decisão em "Decisões técnicas" no README.
3. Ajuste os registros de `TypeOrmModule.forFeature` para que cada módulo declare apenas as entidades
   cujos repositórios ele injeta. Um mesmo entity pode ser registrado em mais de um módulo.
4. Mantenha as relações com a forma lazy dos decorators (`() => Producer`), de modo que os imports
   cruzados entre arquivos de entidade não gerem dependência circular.
5. Não use `forwardRef` e não faça o `ProducersModule` importar o `MoviesModule` (nem o contrário).
   Se isso parecer necessário, pare e me explique o motivo antes de prosseguir.
6. Atualize a árvore de pastas na seção "Arquitetura" do CLAUDE.md.

# Restrições

- Refactor sem mudança de comportamento: nomes de tabelas, de colunas e o schema resultante
  permanecem idênticos.
- Não altere nenhum arquivo de teste nem nenhuma asserção existente.

# Critérios de aceite

- `npm run build`, `npm run lint` e `npm run test:e2e` passam sem erros, com os testes inalterados.
- Nenhuma ocorrência de `forwardRef` em `src/`.
- `git diff --stat` nos arquivos de teste está vazio.
```

**Resultado:**

- `producer.entity.ts` movido com `git mv` para `src/producers/entities/`, com barrel
  `src/producers/entities/index.ts`. Os arquivos de entidade importam uns aos outros
  diretamente (`../../movies/entities/movie.entity`, `../../producers/entities/producer.entity`),
  sem passar pelos barrels, e as relações seguem na forma lazy (`() => Producer`, `() => Movie`).
- Conflito no item 3: nenhum módulo injeta repositórios (a importação usa o `DataSource`), então
  a leitura literal deixaria todos os módulos sem `forFeature`, e o `autoLoadEntities` criaria um
  schema vazio. A IA perguntou antes de seguir e a opção escolhida foi registrar cada entidade no
  módulo dono: `MoviesModule` com `forFeature([Movie, Studio])` e `ProducersModule` com
  `forFeature([Producer])`.
- `CsvImportModule` deixou de importar o `MoviesModule` (só servia para expor repositórios que
  ninguém injeta) e o `MoviesModule` deixou de exportar o `TypeOrmModule`. Nenhum módulo de
  domínio importa outro e não há `forwardRef` em `src/`.
- Numa primeira versão, `src/movies/entities/index.ts` continuou reexportando `Producer`,
  porque `test/csv-import.e2e-spec.ts` importava o tipo de lá e os testes não podiam ser
  alterados. Num pedido seguinte ("Corrija o teste apontado no item 2"), o import do teste
  passou a ser `import type { Producer } from '../src/producers/entities'`, e a reexportação
  foi removida. Nenhuma asserção mudou.
- `csv-import.service.ts` passou a importar `Producer` de `../producers/entities`.
- README: nova seção "Organização das entidades" em "Decisões técnicas" (por que `Studio` fica em
  `movies`, imports lazy, módulos independentes e critério do `forFeature`). CLAUDE.md: árvore da
  seção "Arquitetura" atualizada.
- Verificações: `npm run build`, `npm run lint` e `npm run test:e2e` (12 testes) passaram;
  `git diff --stat -- test` mostra apenas a troca do import. O `sqlite_master` (tabelas, colunas e índices) e as contagens
  de linhas após importar `data/Movielist.csv` foram comparados antes e depois da mudança e são
  idênticos.

**Ajustes manuais:**

---

## 2026-09-22 — Endpoint de intervalos de prêmios

**Ferramenta:** Claude Code (Opus 5.5)

**Prompt:**

```markdown
Leia o CLAUDE.md antes de começar.

# Tarefa: endpoint de intervalos de prêmios

## 1. Cálculo (src/producers/award-intervals.calculator.ts)

Função pura, sem dependência do Nest ou do TypeORM, que recebe uma lista de vitórias
(`{ producer: string; year: number }[]`) e devolve `{ min: ProducerInterval[]; max: ProducerInterval[] }`,
seguindo as regras de negócio do CLAUDE.md:

- agrupa por produtor, ordena os anos e gera um intervalo para cada par consecutivo;
- produtor com uma única vitória não entra no resultado;
- `min` e `max` contêm todos os registros empatados, e um produtor pode aparecer nas duas listas
  ou mais de uma vez na mesma;
- duas vitórias no mesmo ano geram intervalo 0;
- sem nenhum par possível, retorna `{ min: [], max: [] }`;
- ordenação determinística por `previousWin` e depois por `producer`;
- use `reduce` para mínimo e máximo, nunca `Math.min(...array)`.

## 2. Acesso a dados (src/producers/producers.repository.ts)

Crie um `ProducersRepository` com `@Injectable()`, que injeta o repositório de `Producer` via
`@InjectRepository` (já registrado no `forFeature` do `ProducersModule`) e expõe um método
`findAwardWins(): Promise<ProducerWin[]>`.

- Uma única consulta com o query builder, com join na relação de filmes, filtrando apenas
  vencedores e ordenando por produtor e ano. Sem N+1.
- Use `getRawMany` selecionando só nome e ano; não carregue entidades completas com relações.
- Converta o resultado bruto para o tipo de domínio `ProducerWin { producer: string; year: number }`,
  garantindo que `year` seja number. Nenhum campo bruto do banco vaza para fora desta classe.
- Não crie interface nem token de injeção customizado; injete a classe concreta.

O `ProducersService` apenas orquestra: chama `findAwardWins()` e repassa o resultado ao calculator.

Não importe o `MoviesModule` no `ProducersModule`. Se a consulta exigir referenciar `Movie`,
faça o join a partir da relação da própria entidade `Producer` ou registre `Movie` também no
`forFeature` do `ProducersModule`. Se nenhuma dessas alternativas funcionar, pare e me explique
antes de prosseguir.

## 3. Endpoint

`GET /producers/award-intervals`, respondendo 200 com o formato definido no CLAUDE.md.
Crie DTOs de resposta (`ProducerIntervalDto` e `AwardIntervalsResponseDto`) documentados com os
decorators do Swagger, e garanta que o JSON não exponha campos internos como `id`.
A rota deve aparecer em `/api-docs` com o exemplo de resposta.

## 4. Testes de integração (test/award-intervals.e2e-spec.ts)

Sobem o AppModule completo e comparam o corpo inteiro da resposta com `toEqual`. Um cenário por
fixture em `test/fixtures`:

1. `data/Movielist.csv`: min = Joel Silver (1, 1990 → 1991), max = Matthew Vaughn (13, 2002 → 2015).
2. Empate no min e empate no max, com mais de um registro em cada lista.
3. Mesmo produtor presente em `min` e em `max`.
4. Produtor com quatro vitórias, garantindo que os intervalos são entre pares consecutivos
   e não entre a primeira e a última.
5. Produtor com duas vitórias no mesmo ano, resultando em intervalo 0.
6. Nenhum produtor com duas vitórias: `{ "min": [], "max": [] }` com status 200.
7. CSV sem nenhum vencedor: mesmo resultado vazio, sem erro.
8. Filme vencedor com vários produtores, verificando que cada um recebe a vitória.

Mantenha os testes das etapas anteriores passando e sem alterações.

# Critérios de aceite

- `npm run build`, `npm run lint` e `npm run test:e2e` passam sem erros.
- `GET /producers/award-intervals` retorna 200 com o resultado esperado para `data/Movielist.csv`.
- `ProducersModule` não importa `MoviesModule`, e não há `forwardRef` em `src/`.
- Nenhum `*.spec.ts` foi criado em `src/`.
- `git diff` nos testes das etapas anteriores está vazio.
```

**Resultado:**

- `src/producers/award-intervals.calculator.ts`: tipos de domínio `ProducerWin`,
  `ProducerInterval` e `AwardIntervals` e a função pura `calculateAwardIntervals()`. Agrupa os
  anos por produtor num `Map`, ordena os anos de cada um, gera um intervalo por par consecutivo,
  acha o menor e o maior com um único `reduce` e filtra todos os empatados. A ordenação é por
  `previousWin`, depois `producer` (comparação por código de caractere, sem `localeCompare`,
  para não depender do locale) e, como desempate final, `followingWin`. O(n log n).
- `src/producers/producers.repository.ts`: `ProducersRepository` injeta `Repository<Producer>`
  e faz uma única consulta (`innerJoin('producer.movies', 'movie')`, `winner = true`, ordenada
  por nome e ano) com `getRawMany`, selecionando só nome e ano, e converte `year` com
  `Number()`. O join parte da relação da própria entidade `Producer`, então não foi preciso
  registrar `Movie` no `forFeature` nem importar o `MoviesModule`. Não há `DISTINCT`: duas
  vitórias no mesmo ano (filmes diferentes) chegam como duas linhas e geram o intervalo 0.
- `src/producers/producers.service.ts`: apenas chama `findAwardWins()` e repassa ao calculator.
- `src/producers/producers.controller.ts`: `GET /producers/award-intervals` (200), com
  `@ApiTags`, `@ApiOperation` e `@ApiOkResponse`. O controller copia explicitamente os quatro
  campos públicos de cada intervalo para o DTO, então nenhum campo interno chega ao JSON.
- `src/producers/dto/award-intervals-response.dto.ts`: `ProducerIntervalDto` e
  `AwardIntervalsResponseDto` com `@ApiProperty` (descrição e exemplo por campo; `min` e `max`
  com os exemplos do CLAUDE.md). O plugin do Swagger no `nest-cli.json` não está ativo, por
  isso os decorators são explícitos.
- `ProducersModule` registra controller, repository e service; continua sem importar outros
  módulos de domínio.
- `test/award-intervals.e2e-spec.ts`: os 8 cenários pedidos num `describe.each`, cada um
  subindo o `AppModule` com sua fixture e comparando o corpo inteiro com `toEqual`, e mais um
  teste que confere a rota, o schema da resposta e os exemplos no documento OpenAPI
  (`/api-docs-json`). Fixtures `test/fixtures/intervals-*.csv`: nos empates, os produtores
  aparecem fora de ordem no arquivo para exercitar a ordenação por nome; no cenário de quatro
  vitórias, os anos estão fora de ordem e há um segundo produtor com intervalo 8, menor que o
  14 entre a primeira e a última vitória, de modo que um cálculo entre extremos falharia.
- README: seção "Endpoints" com a descrição da rota e a resposta para `data/Movielist.csv`.
- Verificações: `npm run build`, `npm run lint` e `npm run test:e2e` (21 testes, 3 suítes)
  passaram; `git diff -- test` sem alterações nos testes anteriores; nenhum `forwardRef` nem
  `*.spec.ts` em `src/`.

**Ajustes manuais:**

- Os tipos de domínio `ProducerWin`, `ProducerInterval` e `AwardIntervals` saíram de
  `award-intervals.calculator.ts` e foram para um arquivo próprio,
  `src/producers/award-intervals.types.ts`. Antes, o `ProducersRepository` importava
  `ProducerWin` do arquivo do calculator, e assim a camada de dados dependia do arquivo de
  cálculo só por causa de um tipo. Agora repository, calculator, service e DTOs importam os
  tipos desse arquivo neutro. O `ProducerWinRow` continua privado dentro do repository,
  porque representa a linha bruta do banco e não deve sair da classe.
- A função `toDto` foi removida do `ProducersController`, que agora só retorna
  `this.producersService.getAwardIntervals()`, com o retorno tipado como
  `AwardIntervalsResponseDto`. O mapeamento era redundante: o calculator já cria objetos
  novos só com `producer`, `interval`, `previousWin` e `followingWin`, com o mesmo formato
  dos DTOs, e os testes e2e comparam o corpo inteiro com `toEqual`, então um campo extra
  (como `id`) faria o teste falhar.

---

## 2026-09-23 — Fechamento do projeto (documentação e revisão)

**Ferramenta:** Claude Code (Opus 5.5)

**Prompt:**

```markdown
Leia o CLAUDE.md antes de começar.

# Tarefa: fechamento do projeto (documentação e revisão)

Não altere comportamento nem implemente nada novo nesta etapa. Se encontrar um bug ou uma
inconsistência, não corrija por conta própria: liste no relatório final para eu decidir.

## 1. README.md
Complete o README lendo o código para confirmar cada informação. Não documente nada que você não
tenha verificado no repositório.
- Descrição do projeto e stack utilizada.
- Pré-requisitos (versão do Node) e instalação.
- Como rodar a aplicação e como rodar os testes de integração, com os comandos exatos do package.json.
- Variáveis de ambiente, com valores padrão, incluindo como apontar `MOVIELIST_CSV_PATH` para outro
  arquivo CSV.
- Formato esperado do CSV: delimitador, colunas e como múltiplos produtores e estúdios são separados.
- Seção "Endpoints": `GET /producers/award-intervals`, com exemplo real de requisição e de resposta
  (use o resultado obtido com `data/Movielist.csv`), status codes e o link para `/api-docs`.
- Seção "Decisões técnicas", cobrindo:
  - escopo mantido no requisito solicitado, com um único endpoint, e como a API atende ao nível 2 de
    maturidade de Richardson;
  - `min` e `max` numa mesma resposta, conforme o formato especificado no enunciado;
  - separação de produtores por `, and`, `,` e ` and `;
  - intervalos entre vitórias consecutivas, empates retornando todos os registros e ordenação
    determinística;
  - duas vitórias no mesmo ano gerando intervalo 0;
  - banco em memória com `synchronize: true`, justificado por ser efêmero;
  - organização dos módulos, incluindo por que `Studio` não tem módulo próprio;
  - camada de repository isolando o acesso a dados, sem interface nem token de injeção.
- Seção "Limitações conhecidas": identidade do produtor baseada apenas no nome, sem identificador no
  CSV, o que impede distinguir homônimos.
- Seção "Testes": o que cada arquivo de teste cobre e quais fixtures existem, com uma linha por cenário.

## 2. Revisão final
Verifique e relate, sem corrigir:
- se todos os requisitos do enunciado estão atendidos, um a um;
- se restou código morto, import não utilizado, `console.log`, `any` ou TODO;
- se existe algum `*.spec.ts` em `src/`;
- se algum arquivo gerado (node_modules, dist, .env) está versionado indevidamente;
- o resultado de `npm run build`, `npm run lint` e `npm run test:e2e`;
- a saída de `git log --oneline`, apontando commits com mensagem fora do padrão Conventional Commits.

# Critérios de aceite
- README permite que alguém sem contexto clone, rode e teste o projeto apenas seguindo as instruções.
- Nenhuma alteração em arquivos de `src/` ou `test/`.
```

**Resultado:**

- `README.md` reescrito a partir da leitura de `src/`, `test/`, `package.json`, `.nvmrc` e
  `.gitignore`: stack, pré-requisitos, instalação com `git clone` e `cd outsera-challenge/api`,
  execução, testes, variáveis de ambiente (com exemplos para bash, PowerShell e `.env`),
  formato do CSV (inclusive mapeamento por nome, linhas inválidas e duplicadas), endpoint com
  requisição, resposta e status codes, decisões técnicas, limitações conhecidas e tabelas de
  arquivos de teste e fixtures.
- A resposta e os status codes documentados foram obtidos rodando `node dist/main.js` e
  chamando a API: `GET /producers/award-intervals` respondeu 200 com Joel Silver / Matthew
  Vaughn; rota inexistente e `POST` na rota responderam 404; `/api-docs` respondeu 200. As
  mensagens de falha (CSV inexistente e `PORT` inválida) também foram conferidas na prática.
- Revisão final relatada à parte, sem correções. Pontos levantados: `console.log` em
  `src/main.ts`; regra `@typescript-eslint/no-explicit-any` desligada no `eslint.config.mjs`;
  reexportações sem uso em `src/config/index.ts`; `POST` na rota respondendo 404 em vez de 405;
  `test/app.e2e-spec.ts` sem fixture própria; regra de linhas duplicadas descartando um
  `winner = yes` posterior; árvore do `CLAUDE.md` citando endpoints `/movies` inexistentes.
- Verificações: `npm run build`, `npm run lint` (sem alterações) e `npm run test:e2e`
  (21 testes, 3 suítes) passaram. Nenhum arquivo de `src/` ou `test/` foi alterado.

**Ajustes manuais:**

---

## 2026-09-23 — Ajustes após a revisão final

**Ferramenta:** Claude Code (Opus 5.5)

**Prompt:**

```markdown
1 - Ok, manter assim
2 - Ok, manter
3 - Remover o export desnecessário ou corrigir os imports
4 - Ok, manter
5 - Regisitre a regra no `CLAUDE.md`
6 - Ok, manter
7 - Atualize o que for necessário no `CLAUDE.md`
8 - Ok, manter
```

**Resultado:**

- Item 3: `src/config/index.ts` passou a exportar só `AppConfigModule` e `AppConfigService`,
  os únicos nomes importados pelo barrel. `DEFAULT_PORT`, `DEFAULT_MOVIELIST_CSV_PATH`,
  `EnvironmentVariables` e `validateEnvironment` continuam exportados por
  `environment-variables.ts`, de onde já eram importados dentro de `src/config/`.
- Item 5: nova regra em "Regras de negócio" do `CLAUDE.md`: linhas duplicadas (mesmo `year`,
  `title`, `studios` e `producers`, sem considerar a ordem dos nomes) são ignoradas com
  warning, e vale a primeira ocorrência, inclusive o seu `winner`.
- Item 7: árvore da seção "Arquitetura" do `CLAUDE.md` atualizada: `movies/` sem endpoints,
  `producers/` com repository e DTOs e a pasta `test/utils/`.
- Verificações: `npm run build`, `npm run lint` e `npm run test:e2e` (21 testes, 3 suítes)
  passaram. Nenhum comportamento foi alterado.

**Ajustes manuais:**
