# Golden Raspberry Awards — Front-end

Interface web para consultar a lista de indicados e vencedores da categoria **Pior Filme** do
Golden Raspberry Awards. Os dados vêm da API pública
[`https://challenge.outsera.tech/api/movies`](https://challenge.outsera.tech/swagger-ui/index.html);
este projeto não tem back-end, apenas consome a API.

A aplicação tem duas telas, acessíveis pelo menu lateral: **Dashboard** e **Lista de filmes**.

## Pré-requisitos

- Node.js 24 (LTS). A versão está fixada no `.nvmrc`; com o nvm, basta rodar `nvm use`.
  Versão aceita (campo `engines`): `^24.15.0`.
- npm 10 ou superior.

## Instalação

```bash
npm install
```

## Como rodar

```bash
npm start
```

A aplicação sobe em `http://localhost:4200/`.

## Como rodar os testes

Os testes unitários usam Vitest (runner padrão do Angular CLI) e não fazem requisições de rede.

```bash
npm test                     # execução única
npm run test:watch           # modo watch
npm run test -- --coverage   # execução única com relatório de cobertura
```

A cobertura é medida sobre todo o `src/` (TypeScript e templates), exceto `main.ts`, os arquivos
de environment, os `*.spec.ts`, os helpers de teste em `src/testing/` e barrels (`index.ts`).
Os limites mínimos ficam em `angular.json` (`coverageThresholds`); com `--coverage`, o comando
falha se a cobertura cair abaixo deles. O relatório HTML é gerado em `coverage/app/`.

Lint e formatação:

```bash
npm run lint           # ESLint (angular-eslint)
npm run format:check   # verifica a formatação com Prettier
npm run format         # aplica a formatação
```

## Como fazer o build

```bash
npm run build
```

Os artefatos de produção são gerados em `dist/app/browser`.

## Funcionalidades

## Arquitetura

## Decisões técnicas

- **Budget do bundle inicial em 700 kB.** O CSS do Bootstrap é importado por inteiro em
  `src/styles.scss` e responde pela maior parte do bundle inicial; o limite de aviso foi
  elevado de 500 kB para 700 kB para acomodá-lo. O limite de erro continua em 1 MB.

## Uso de IA
