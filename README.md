# Outsera Challenge: Golden Raspberry Awards

Soluções para as avaliações técnicas de **back-end** e **front-end** da Outsera. Os dois projetos
tratam da lista de indicados e vencedores da categoria **Pior Filme** do Golden Raspberry Awards.

| Projeto       | Diretório        | Stack                                              | Enunciado                                           |
| ------------- | ---------------- | -------------------------------------------------- | --------------------------------------------------- |
| API RESTful   | [`api/`](./api/) | NestJS 11, TypeORM, SQLite em memória, Jest        | [`api/docs/Avaliação - Back-end.pdf`](./api/docs/)  |
| Interface web | [`app/`](./app/) | Angular 22 (standalone, zoneless, signals), Vitest | [`app/docs/Avaliação - Front-end.pdf`](./app/docs/) |

Cada projeto é independente, com `package.json`, dependências, testes e documentação próprios.
Este README dá a visão geral e o caminho mais curto para rodar tudo; os detalhes de cada um
(decisões técnicas, cenários de teste, limitações conhecidas) estão nos READMEs dos diretórios:

- **[`api/README.md`](./api/README.md)**: formato do CSV, endpoint, nível 2 de Richardson, cálculo
  dos intervalos e fixtures de teste.
- **[`app/README.md`](./app/README.md)**: telas, arquitetura, decisões técnicas e cobertura de
  testes.

> **Os projetos não se comunicam.** O front-end consome a API pública da Outsera
> (`https://challenge.outsera.tech/api/movies`), conforme o enunciado, e não a API deste
> repositório. A API local implementa só o endpoint pedido na avaliação de back-end
> (`GET /producers/award-intervals`), que não cobre o que o front-end precisa.

## Visão geral

### Back-end (`api/`)

Na inicialização, lê `data/Movielist.csv` e carrega os dados num banco **SQLite em memória**
(nenhuma instalação de SGBD é necessária). Expõe o endpoint `GET /producers/award-intervals`, que
retorna os produtores com o **menor** e o **maior** intervalo entre duas vitórias consecutivas,
incluindo todos os empates. O CSV pode ser trocado pela variável `MOVIELIST_CSV_PATH`, e a
documentação OpenAPI fica disponível no Swagger UI.

Os testes são **exclusivamente de integração**: sobem a aplicação completa e validam as respostas
contra fixtures com cenários como empates, mesmo produtor em `min` e `max`, vitórias no mesmo ano,
linhas duplicadas e CSVs inválidos.

### Front-end (`app/`)

Aplicação Angular com menu lateral e duas telas:

- **Dashboard**, com quatro painéis: anos com mais de um vencedor, top 3 estúdios com mais
  vitórias, produtores com maior e menor intervalo entre vitórias e busca de vencedores por ano.
- **Lista de filmes**, paginada, com filtros por ano e por vencedor.

O layout segue os anexos do enunciado e é responsivo a partir de 768x1280. Os testes unitários
cobrem serviços, componentes, páginas e funções puras, com o HTTP simulado.

## Estrutura do repositório

```text
outsera-challenge/
├── api/                  # Back-end (NestJS)
│   ├── data/             # Movielist.csv carregado na inicialização
│   ├── docs/             # enunciado (PDF) e ai-log.md
│   ├── src/              # config, database, movies, producers, csv-import
│   ├── test/             # testes de integração e fixtures CSV
│   ├── CLAUDE.md         # instruções persistentes do agente de IA
│   └── README.md
└── app/                  # Front-end (Angular)
    ├── docs/             # enunciado (PDF) e ai-log.md
    ├── src/app/          # core, shared, features (dashboard, movies)
    ├── CLAUDE.md         # instruções persistentes do agente de IA
    └── README.md
```

## Pré-requisitos

- **Node.js 24**, a versão do `.nvmrc` de cada projeto. Com o nvm, rode `nvm install` e
  `nvm use` dentro do diretório do projeto.
- **npm 10** ou superior.
- **Git**.

Nenhum banco de dados, Docker ou serviço externo precisa ser instalado. O front-end só precisa de
acesso à internet para alcançar a API da Outsera.

## Início rápido

```bash
git clone https://github.com/Nadine-Schneider/outsera-challenge.git
cd outsera-challenge
```

### API

```bash
cd api
npm install
npm run start:dev      # http://localhost:3000
npm test               # testes de integração
```

- Endpoint: <http://localhost:3000/producers/award-intervals>
- Swagger UI: <http://localhost:3000/api-docs>

Para usar outro arquivo CSV:

```bash
MOVIELIST_CSV_PATH=/caminho/para/outra-lista.csv npm run start:dev
```

### Front-end

```bash
cd app
npm install
npm start              # http://localhost:4200
npm test               # testes unitários
```

### Rodando os dois ao mesmo tempo

A API usa a porta `3000` por padrão, a mesma usada por `npm run serve:prod` no front-end. Com
`npm start` (porta `4200`) não há conflito. Se precisar do build de produção do front-end com a
API no ar, suba a API em outra porta:

```bash
PORT=3001 npm run start:dev
```

## Comandos principais

Todos rodam dentro do diretório do respectivo projeto.

| Objetivo                | `api/`               | `app/`                       |
| ----------------------- | -------------------- | ---------------------------- |
| Desenvolvimento         | `npm run start:dev`  | `npm start`                  |
| Build                   | `npm run build`      | `npm run build`              |
| Build de produção local | `npm run start:prod` | `npm run serve:prod`         |
| Testes                  | `npm test`           | `npm test`                   |
| Cobertura               | —                    | `npm run test -- --coverage` |
| Lint                    | `npm run lint:check` | `npm run lint`               |
| Formatação              | `npm run format`     | `npm run format`             |

Na API, `npm run lint` também aplica correções automáticas; `lint:check` apenas verifica.

## Uso de ferramentas de IA

Os dois projetos foram desenvolvidos com o **Claude Code**, em etapas com escopo fechado e revisão
humana entre elas. Em cada diretório:

- **`CLAUDE.md`**: instruções persistentes lidas pelo agente antes de cada tarefa (stack, regras
  de negócio, arquitetura, convenções e critérios de teste).
- **`docs/ai-log.md`**: registro cronológico das interações, com o prompt, o resultado relatado
  pelo agente e os ajustes feitos manualmente na revisão, incluindo sugestões corrigidas ou
  rejeitadas.

Registros: [`api/docs/ai-log.md`](./api/docs/ai-log.md) ·
[`app/docs/ai-log.md`](./app/docs/ai-log.md)

## Autora

**Nadine Schneider**: [github.com/Nadine-Schneider](https://github.com/Nadine-Schneider)
