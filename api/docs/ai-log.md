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
