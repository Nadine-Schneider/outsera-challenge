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
npm test             # execução única
npm run test:watch   # modo watch
```

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

## Uso de IA
