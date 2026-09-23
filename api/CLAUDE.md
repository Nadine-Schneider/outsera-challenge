# CLAUDE.md

Instruções persistentes para o agente de IA neste repositório. Leia este arquivo antes de qualquer tarefa.

## Visão geral

API RESTful que lê a lista de indicados e vencedores da categoria "Pior Filme" do Golden Raspberry Awards.
Na inicialização, a aplicação carrega um arquivo CSV num banco SQLite em memória e expõe um endpoint que retorna os produtores com o menor e o maior intervalo entre dois prêmios consecutivos.

A qualidade, clareza e desempenho do código são fundamentais para este projeto. Após concluído o projeto, a aplicação também será executada com **outros arquivos CSV**, então o resultado precisa estar correto para qualquer entrada válida, não só para o arquivo de exemplo.

## Stack

- Node.js (versão em `.nvmrc`), NestJS, TypeScript em modo strict
- TypeORM + `better-sqlite3` com `database: ':memory:'`
- `@nestjs/config` para variáveis de ambiente, `csv-parse` para leitura do CSV
- `class-validator` / `class-transformer` para validação, `@nestjs/swagger` para documentação
- Jest + Supertest para testes

## Comandos

```bash
npm install          # instalar dependências
npm run start:dev    # rodar em modo desenvolvimento
npm run build        # compilar
npm run lint         # lint
npm run test:e2e     # testes de integração
```

## Requisitos obrigatórios (não negociáveis)

1. O CSV é lido e inserido no banco ao iniciar a aplicação.
2. API no **nível 2 de maturidade de Richardson**: recursos nomeados por substantivos, verbos HTTP com a
   semântica correta e status codes adequados (200, 201, 204, 400, 404).
3. **Somente testes de integração.** Não crie testes unitários (`*.spec.ts` em `src/`).
4. Banco em memória com SGBD embarcado. Nenhuma instalação externa pode ser necessária.
5. README com instruções para rodar o projeto e os testes.
6. Registro das interações com IA em `docs/ai-log.md`.

## Regras de negócio

- Formato do CSV: delimitador `;`, cabeçalho `year;title;studios;producers;winner`.
  Mapeie as colunas pelo nome do cabeçalho, nunca pela posição. Trate BOM, CRLF e linhas vazias.
- Um filme é vencedor quando `winner`, após trim e sem diferenciar maiúsculas, é igual a `yes`.
- O campo `producers` (e também `studios`) contém vários nomes. Separe por `, and`, `,` e `and`
  (ex.: `"A, B, and C"`, `"A, B and C"`, `"A and B"`). Faça trim, descarte vazios e remova duplicados
  dentro do mesmo filme.
- O intervalo é calculado entre vitórias **consecutivas** de um mesmo produtor, com os anos ordenados.
  Vitórias em 2000, 2005 e 2020 geram os intervalos 5 e 15.
- Produtores com uma única vitória não entram no cálculo.
- `min` e `max` retornam **todos** os registros empatados no menor e no maior intervalo. Um mesmo produtor
  pode aparecer nas duas listas ou mais de uma vez na mesma lista.
- Duas vitórias do mesmo produtor no mesmo ano (filmes diferentes) geram intervalo 0.
- Sem nenhum intervalo possível, a resposta é `{ "min": [], "max": [] }` com status 200.
- A ordenação da resposta é determinística: por `previousWin` e depois por `producer`.
- Formato da resposta de `GET /producers/award-intervals`:

```json
{
  "min": [
    {
      "producer": "Producer 1",
      "interval": 1,
      "previousWin": 2008,
      "followingWin": 2009
    }
  ],
  "max": [
    {
      "producer": "Producer 1",
      "interval": 99,
      "previousWin": 1900,
      "followingWin": 1999
    }
  ]
}
```

## Arquitetura

Estrutura modular por domínio, com camadas simples: controller, service e repository. Sem hexagonal ou DDD
completo; não crie abstrações antes de serem necessárias.

```
src/
  config/        # configuração tipada e validação das variáveis de ambiente
  database/      # configuração do TypeORM
  movies/        # entidades Movie e Studio e endpoints /movies
  producers/     # entidade Producer, endpoint /producers/award-intervals e cálculo dos intervalos
  csv-import/    # importação do CSV no bootstrap e parser de nomes
test/
  fixtures/      # CSVs pequenos, um por cenário
data/
  Movielist.csv  # arquivo padrão
docs/
  ai-log.md
```

- Modelo normalizado: `movies`, `producers`, `studios` e as tabelas N:N `movie_producers` e `movie_studios`.
- O caminho do CSV vem da variável `MOVIELIST_CSV_PATH` (padrão `data/Movielist.csv`).
- A importação roda no bootstrap, dentro de uma transação e com inserts em lote. CSV ausente ou sem colunas
  obrigatórias faz a aplicação falhar com mensagem clara; linhas inválidas são ignoradas com log de warning.
- O cálculo dos intervalos fica numa função pura, separada do acesso a dados. Complexidade O(n log n).

## Convenções de código

- Identificadores, nomes de arquivos e commits em inglês; documentação (README, docs) em português.
- Sem `any`. Tipos explícitos em contratos públicos (DTOs, retornos de services).
- DTOs de resposta documentados com decorators do Swagger.
- Evite `Math.min(...array)` / `Math.max(...array)` com arrays de tamanho variável; use `reduce`.
- Commits no padrão Conventional Commits (`feat:`, `fix:`, `chore:`, `test:`, `docs:`).

## Testes

- Apenas testes e2e em `test/`, subindo o `AppModule` completo com Supertest.
- Cada cenário usa sua própria fixture CSV, apontada via `MOVIELIST_CSV_PATH`.
- Compare o corpo inteiro da resposta com `toEqual`, não apenas campos isolados.
- Feche a aplicação no `afterAll`.
- Resultado esperado com `data/Movielist.csv`: min = Joel Silver (1, 1990 → 1991);
  max = Matthew Vaughn (13, 2002 → 2015).

## Como trabalhar neste repositório

- Execute somente o escopo da tarefa pedida. Não antecipe etapas futuras.
- Não adicione dependências fora da stack acima sem perguntar antes.
- Antes de concluir, rode `npm run build`, `npm run lint` e `npm run test:e2e` e corrija o que falhar.
- Ao final de cada tarefa, informe: arquivos criados ou alterados, comandos executados e decisões que
  devem ser revisadas por mim.
- Adicione uma entrada em `docs/ai-log.md` resumindo a tarefa. Não escreva a seção "Ajustes manuais";
  ela é preenchida por mim.
