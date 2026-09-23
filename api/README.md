# Golden Raspberry Awards API

API RESTful que expõe a lista de indicados e vencedores da categoria **Pior Filme** do
Golden Raspberry Awards.

Na inicialização, a aplicação lê um arquivo CSV e carrega os dados em um banco **SQLite em
memória**. O banco é recriado a cada execução, portanto nenhuma instalação de SGBD é
necessária. O endpoint `GET /producers/award-intervals` retorna os produtores com o menor e o
maior intervalo entre duas premiações consecutivas.

## Stack

- **Node.js 24** e **TypeScript** em modo `strict`
- **NestJS 11** (`@nestjs/core`, `@nestjs/platform-express`)
- **TypeORM** com **`better-sqlite3`** e `database: ':memory:'` (SGBD embarcado)
- **`@nestjs/config`** para variáveis de ambiente, validadas com **`class-validator`** /
  **`class-transformer`**
- **`csv-parse`** para leitura do CSV
- **`@nestjs/swagger`** para a documentação OpenAPI
- **Jest** + **Supertest** para os testes de integração
- **ESLint** + **Prettier**

## Pré-requisitos

- **Node.js** na versão indicada em [`.nvmrc`](./.nvmrc) (`24`). O `package.json` exige
  `node >= 24`. Com `nvm` instalado:

  ```bash
  nvm install
  nvm use
  ```

- **npm** 10 ou superior (já incluído no Node 24).
- **Git**, para clonar o repositório.

Não é preciso instalar banco de dados: o SQLite é embarcado via `better-sqlite3`.

## Instalação

O projeto fica no diretório `api/` do repositório. Todos os comandos abaixo devem ser
executados a partir dele.

```bash
git clone https://github.com/Nadine-Schneider/outsera-challenge.git
cd outsera-challenge/api
npm install
```

## Como rodar a aplicação

```bash
npm run start:dev    # desenvolvimento, com watch
npm run start        # execução simples (compila e sobe)
npm run build        # compila para dist/
npm run start:prod   # executa o build de dist/ (rode npm run build antes)
```

Ao subir, a aplicação importa o CSV e registra no log um resumo da importação, por exemplo:

```text
Imported 206 movies (42 winners), 359 producers and 59 studios from .../data/Movielist.csv
Application is running on http://localhost:3000
Swagger UI is available at http://localhost:3000/api-docs
```

A documentação interativa (Swagger UI) fica em <http://localhost:3000/api-docs> e o documento
OpenAPI em <http://localhost:3000/api-docs-json>.

## Como rodar os testes

O projeto tem **apenas testes de integração (e2e)**, que sobem o `AppModule` completo e o
exercitam via HTTP ou consultando o banco. Não é preciso subir a aplicação antes.

```bash
npm run test:e2e
```

`npm test` é um alias para o mesmo comando. Outros comandos úteis:

```bash
npm run lint         # ESLint + Prettier (aplica correções automáticas)
npm run format       # formata src/ e test/ com Prettier
```

## Variáveis de ambiente

Todas são opcionais e validadas no bootstrap: um valor inválido impede a aplicação de subir,
com uma mensagem explicando o problema (`Invalid environment variables: ...`).

| Variável             | Padrão               | Descrição                                                        |
| -------------------- | -------------------- | ---------------------------------------------------------------- |
| `PORT`               | `3000`               | Porta HTTP da aplicação. Inteiro entre 1 e 65535.                |
| `MOVIELIST_CSV_PATH` | `data/Movielist.csv` | Caminho do CSV carregado na inicialização. Não pode ser vazio.   |

Os valores podem ser definidos no ambiente ou em um arquivo `.env` na raiz de `api/` (ignorado
pelo git). Caminhos relativos são resolvidos a partir do diretório em que o comando é
executado.

### Usando outro arquivo CSV

Aponte `MOVIELIST_CSV_PATH` para o arquivo desejado (caminho relativo ou absoluto):

```bash
# Linux, macOS ou Git Bash
MOVIELIST_CSV_PATH=/caminho/para/outra-lista.csv npm run start:dev
```

```powershell
# Windows PowerShell
$env:MOVIELIST_CSV_PATH = "C:\caminho\para\outra-lista.csv"; npm run start:dev
```

Ou, num arquivo `.env`:

```dotenv
MOVIELIST_CSV_PATH=/caminho/para/outra-lista.csv
PORT=3000
```

Se o arquivo não existir, estiver vazio ou não tiver alguma coluna obrigatória, a aplicação
não sobe e informa o motivo, por exemplo:

```text
Could not read the movie list CSV file at "..." (check MOVIELIST_CSV_PATH): ENOENT: ...
The movie list CSV file at "..." is missing the required column(s): winner. Expected header: year;title;studios;producers;winner.
```

## Formato esperado do CSV

```text
year;title;studios;producers;winner
1980;Can't Stop the Music;Associated Film Distribution;Allan Carr;yes
1980;Cruising;Lorimar Productions, United Artists;Jerry Weintraub;
```

- **Delimitador:** `;`.
- **Cabeçalho obrigatório** com as colunas `year`, `title`, `studios`, `producers` e `winner`.
  As colunas são mapeadas pelo **nome**, não pela posição: a ordem é livre, maiúsculas e
  espaços em volta do nome são ignorados e colunas extras são aceitas.
- **Codificação e linhas:** BOM UTF-8, quebras de linha CRLF ou LF e linhas vazias são
  tratados. Espaços no início e no fim de cada campo são removidos.
- **`year`:** apenas dígitos. **`title`:** não pode ser vazio. Linhas que não atendem a isso
  são ignoradas, com um warning no log indicando a linha.
- **`winner`:** o filme é vencedor quando o valor, sem espaços e sem diferenciar maiúsculas, é
  `yes` (`yes`, `Yes`, `YES`...). Qualquer outro valor, inclusive vazio, significa não vencedor.
- **`producers` e `studios`:** vários nomes na mesma célula, separados por `, and`, `,` ou
  ` and ` (o `and` em qualquer combinação de maiúsculas e minúsculas, como palavra isolada).
  Todos os formatos abaixo geram `A`, `B` e `C`:

  ```text
  A, B, and C
  A, B and C
  A and B and C
  ```

  O `and` só separa quando está cercado por espaços, então nomes como `Andrew Bergman` ou
  `Brandon Anderson` ficam intactos. Os nomes passam por trim, espaços internos repetidos
  viram um só, vazios são descartados e repetições dentro do mesmo filme são removidas. Um
  mesmo nome em filmes diferentes corresponde a um único produtor (ou estúdio) no banco.
- **Linhas duplicadas:** uma linha com mesmo `year`, `title`, `studios` e `producers` (a ordem
  dos nomes não importa) de uma linha anterior é ignorada, com warning. É gravada só a primeira
  ocorrência, com os seus estúdios e produtores, e o filme é vencedor quando **qualquer** uma
  das ocorrências tiver `winner = yes`. Assim, uma linha repetida de um filme vencedor não conta
  duas vitórias no mesmo ano (o que geraria um intervalo 0 falso), e uma vitória que aparece só
  numa ocorrência posterior não é perdida em silêncio. Uma duplicata sem `yes` nunca desmarca
  uma vitória, e o warning informa quando a duplicata promoveu o filme a vencedor.

## Endpoints

| Método | Rota                          | Descrição                                                   |
| ------ | ----------------------------- | ----------------------------------------------------------- |
| `GET`  | `/producers/award-intervals`  | Produtores com o menor e o maior intervalo entre vitórias.  |

A documentação completa, com schema e exemplos, está no Swagger UI em
<http://localhost:3000/api-docs> (OpenAPI em JSON: <http://localhost:3000/api-docs-json>).

### `GET /producers/award-intervals`

Retorna os produtores com o menor (`min`) e o maior (`max`) intervalo, em anos, entre duas
vitórias consecutivas.

- Cada lista traz **todos** os registros empatados, ordenados por `previousWin` e depois por
  `producer`.
- Um mesmo produtor pode aparecer nas duas listas, ou mais de uma vez na mesma lista.
- Produtores com uma única vitória não entram no cálculo.
- Duas vitórias do mesmo produtor no mesmo ano (filmes diferentes) geram intervalo `0`.
- Sem nenhum intervalo possível, a resposta é `{ "min": [], "max": [] }`, também com `200`.

Requisição:

```bash
curl -i http://localhost:3000/producers/award-intervals
```

Resposta com `data/Movielist.csv`:

```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
```

```json
{
  "min": [
    {
      "producer": "Joel Silver",
      "interval": 1,
      "previousWin": 1990,
      "followingWin": 1991
    }
  ],
  "max": [
    {
      "producer": "Matthew Vaughn",
      "interval": 13,
      "previousWin": 2002,
      "followingWin": 2015
    }
  ]
}
```

| Campo          | Tipo     | Descrição                                   |
| -------------- | -------- | ------------------------------------------- |
| `producer`     | `string` | Nome do produtor.                           |
| `interval`     | `number` | Anos entre as duas vitórias consecutivas.   |
| `previousWin`  | `number` | Ano da vitória anterior.                    |
| `followingWin` | `number` | Ano da vitória seguinte.                    |

Status codes:

| Status          | Quando                                                                        |
| --------------- | ----------------------------------------------------------------------------- |
| `200 OK`        | Sempre que a rota é chamada com `GET`, inclusive quando não há intervalos.    |
| `404 Not Found` | Rota inexistente ou método não suportado (ex.: `POST` nesta rota).            |

A rota não recebe parâmetros nem corpo, por isso não há cenário de `400 Bad Request`.

## Decisões técnicas

### Escopo e nível 2 de Richardson

O escopo foi mantido no requisito solicitado: um único endpoint de leitura,
`GET /producers/award-intervals`. Não foram criados CRUDs nem rotas de listagem de filmes,
estúdios ou produtores que o enunciado não pede.

A API atende ao nível 2 do modelo de maturidade de Richardson:

- **Recursos nomeados por substantivos:** `producers` é a coleção e `award-intervals` é um
  recurso derivado dela; não há verbos na URL (nada como `/getIntervals`).
- **Verbos HTTP com a semântica correta:** a consulta é uma leitura sem efeitos colaterais,
  portanto `GET`, seguro e idempotente.
- **Status codes adequados:** `200` para a consulta (inclusive com resultado vazio, que é uma
  resposta válida e não um recurso inexistente) e `404` para rotas ou métodos inexistentes.
  `201` e `204` não se aplicam porque não há operações de escrita, e `400` não se aplica
  porque a rota não recebe entrada. O `ValidationPipe` global já está configurado para
  responder `400` caso rotas com entrada sejam adicionadas.

### `min` e `max` numa mesma resposta

O enunciado especifica um único objeto com as chaves `min` e `max`. Por isso o endpoint
devolve os dois extremos juntos, em vez de rotas ou parâmetros separados. Os dois saem do
mesmo conjunto de intervalos, calculado numa única passagem.

### Separação de produtores

O campo `producers` (e também `studios`) usa separadores mistos no arquivo original:
`"A, B, and C"`, `"A, B and C"` e `"A and B"`. A função `parseNameList`
(`src/csv-import/name-list.parser.ts`) divide por `, and`, `,` e ` and ` com uma única
expressão regular, sem diferenciar maiúsculas, exigindo espaço em volta do `and` para não
quebrar nomes como `Andrew` ou `Anderson`. Em seguida faz trim, descarta vazios e remove
duplicados dentro do mesmo filme. Assim cada produtor de um filme vencedor recebe a vitória
individualmente.

### Cálculo dos intervalos

- O cálculo fica numa função pura, `calculateAwardIntervals`
  (`src/producers/award-intervals.calculator.ts`), sem dependência do Nest nem do TypeORM.
- As vitórias são agrupadas por produtor, os anos de cada um são ordenados e é gerado um
  intervalo para **cada par consecutivo**. Vitórias em 2000, 2005 e 2020 geram 5 e 15; o
  intervalo entre a primeira e a última (20) não é considerado.
- O menor e o maior valor são obtidos com um único `reduce` (sem `Math.min(...array)`, que
  pode estourar a pilha com arrays grandes) e depois são filtrados **todos** os registros
  empatados em cada extremo.
- A ordenação é determinística: `previousWin`, depois `producer` e, como último desempate,
  `followingWin`. Os nomes são comparados por código de caractere, sem `localeCompare`, para
  que o resultado não dependa do locale da máquina.
- Complexidade O(n log n), dominada pelas ordenações.

### Duas vitórias no mesmo ano

Se um produtor vence com dois filmes diferentes no mesmo ano, são duas vitórias distintas e o
intervalo entre elas é `0`. A consulta do repository não usa `DISTINCT`, justamente para não
perder esse caso.

### Banco em memória com `synchronize: true`

O banco é SQLite em memória (`database: ':memory:'`), criado a cada inicialização e
descartado ao encerrar. Como não há dados a preservar entre execuções, o schema é gerado a
partir das entidades com `synchronize: true`, sem migrations. Em um banco persistente essa
opção seria inadequada, porque pode alterar ou apagar dados ao mudar as entidades.

O modelo é normalizado: `movies`, `producers`, `studios` e as tabelas N:N `movie_producers` e
`movie_studios`. A importação roda no bootstrap, dentro de uma única transação e com inserts
em lotes de 500 linhas.

### Organização dos módulos

```text
src/
  config/        # configuração tipada e validação das variáveis de ambiente
  database/      # configuração do TypeORM
  movies/        # entidades Movie e Studio
  producers/     # entidade Producer, endpoint, repository e cálculo dos intervalos
  csv-import/    # importação do CSV no bootstrap e parser de nomes
```

- Os módulos são organizados por domínio. `ProducersModule` concentra tudo o que o endpoint
  precisa: controller, service, repository, DTOs e o cálculo.
- `Studio` não tem módulo próprio porque não tem regra de negócio nem endpoint: existe apenas
  como atributo normalizado de `Movie`. Por isso a entidade fica em `movies/`, registrada no
  `MoviesModule`. Um módulo separado seria uma abstração sem uso.
- Nenhum módulo de domínio importa outro e não há `forwardRef`. A importação do CSV usa o
  `DataSource` diretamente, e o join entre produtores e filmes parte da relação da própria
  entidade `Producer`.

### Camada de repository

O acesso a dados do endpoint fica em `ProducersRepository`, que executa uma única consulta
(join de produtores com filmes vencedores, com `getRawMany` selecionando só nome e ano) e
converte o resultado para o tipo de domínio `ProducerWin`. Nenhum campo bruto do banco sai
dessa classe, e o service apenas repassa as vitórias ao cálculo.

O repository é uma classe concreta injetada diretamente, sem interface nem token de injeção.
Com uma única implementação e testes apenas de integração (que usam o banco real), uma
interface não traria benefício e só acrescentaria indireção.

## Limitações conhecidas

- **Identidade do produtor baseada apenas no nome.** O CSV não traz identificador para
  produtores, então dois produtores homônimos são tratados como a mesma pessoa, e suas
  vitórias se somam no cálculo. Pela mesma razão, variações de grafia do mesmo nome (por
  exemplo, diferenças de maiúsculas ou acentos) resultam em produtores distintos.

## Testes

Todos os testes ficam em `test/` e sobem o `AppModule` completo. Cada cenário aponta
`MOVIELIST_CSV_PATH` para sua própria fixture (via `test/utils/create-test-app.ts`), e as
respostas do endpoint são comparadas por inteiro com `toEqual`.

### Arquivos de teste

| Arquivo                            | O que cobre                                                                                         |
| ---------------------------------- | --------------------------------------------------------------------------------------------------- |
| `test/app.e2e-spec.ts`             | Bootstrap da aplicação: Swagger UI em `/api-docs` e documento OpenAPI em `/api-docs-json`.          |
| `test/csv-import.e2e-spec.ts`      | Importação do CSV: contagens, separação de nomes, flag `winner`, linhas inválidas e duplicadas, lotes e falhas de inicialização. |
| `test/award-intervals.e2e-spec.ts` | `GET /producers/award-intervals` em cada cenário de intervalos e a documentação da rota no OpenAPI.  |

### Cenários e fixtures

| Fixture                                                | Cenário                                                                                                  |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| `data/Movielist.csv`                                   | Arquivo padrão: 206 filmes, 42 vencedores, 359 produtores e 59 estúdios; min Joel Silver, max Matthew Vaughn. |
| `test/fixtures/name-formats.csv`                       | Cabeçalho fora de ordem, com BOM e espaços; separadores `, and`, `,`, ` and ` em várias caixas; `winner` com variações. |
| `test/fixtures/invalid-rows.csv`                       | Linhas sem ano, com ano não numérico ou sem título são ignoradas.                                        |
| `test/fixtures/duplicate-rows.csv`                     | Linhas duplicadas (mesmo ano, título, estúdios e produtores) são ignoradas, mantendo a primeira; o filme é vencedor se qualquer ocorrência for. |
| `test/fixtures/missing-column.csv`                     | CSV sem a coluna `winner` impede a aplicação de subir.                                                   |
| `test/fixtures/does-not-exist.csv` (não existe)        | Caminho inexistente impede a aplicação de subir, com mensagem citando `MOVIELIST_CSV_PATH`.              |
| CSV gerado em diretório temporário                     | 1.201 filmes, forçando três lotes de insert; ids sequenciais e vínculos corretos.                        |
| `test/fixtures/intervals-ties.csv`                     | Empates no menor e no maior intervalo, com todos os registros retornados e ordenados.                    |
| `test/fixtures/intervals-same-producer-min-max.csv`    | O mesmo produtor aparece em `min` e em `max`.                                                            |
| `test/fixtures/intervals-four-wins.csv`                | Produtor com quatro vitórias fora de ordem: intervalos só entre vitórias consecutivas.                   |
| `test/fixtures/intervals-same-year.csv`                | Duas vitórias do mesmo produtor no mesmo ano geram intervalo 0.                                          |
| `test/fixtures/intervals-duplicate-winner.csv`         | A vitória que forma o intervalo só existe numa linha duplicada posterior, e não é contada em dobro.       |
| `test/fixtures/intervals-single-wins.csv`              | Nenhum produtor com duas vitórias: `{ "min": [], "max": [] }`.                                           |
| `test/fixtures/intervals-no-winners.csv`               | Nenhum filme vencedor: `{ "min": [], "max": [] }`.                                                       |
| `test/fixtures/intervals-multiple-producers.csv`       | Filmes vencedores com vários produtores: cada um recebe a vitória.                                       |

`test/app.e2e-spec.ts` não usa fixture própria: sobe a aplicação com o CSV padrão.
