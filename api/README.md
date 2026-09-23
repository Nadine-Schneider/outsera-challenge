# Golden Raspberry Awards API

API RESTful que expõe a lista de indicados e vencedores da categoria **Pior Filme** do
Golden Raspberry Awards.

Na inicialização, a aplicação lê um arquivo CSV e carrega os dados em um banco **SQLite em
memória**. O banco é recriado a cada execução, portanto nenhuma instalação de SGBD é
necessária. O endpoint principal retorna os produtores com o menor e o maior intervalo entre
duas premiações consecutivas.

## Pré-requisitos

- **Node.js** na versão indicada em [`.nvmrc`](./.nvmrc) (linha LTS 24). Com `nvm` instalado:

  ```bash
  nvm install
  nvm use
  ```

- **npm** 10 ou superior (já incluído no Node 24).

Não é preciso instalar banco de dados: o SQLite é embarcado via `better-sqlite3`.

## Instalação

```bash
npm install
```

## Como rodar

```bash
npm run start:dev    # desenvolvimento, com watch
npm run start        # execução simples
npm run build        # compila para dist/
npm run start:prod   # executa o build de dist/
```

Com a aplicação de pé, a documentação interativa (Swagger UI) fica disponível em
<http://localhost:3000/api-docs> e o documento OpenAPI em
<http://localhost:3000/api-docs-json>.

## Como rodar os testes

O projeto tem **apenas testes de integração (e2e)**, que sobem a aplicação completa e a
exercitam via HTTP. Cada cenário usa sua própria fixture CSV, apontada por
`MOVIELIST_CSV_PATH`.

```bash
npm run test:e2e
```

Outros comandos úteis:

```bash
npm run lint         # ESLint + Prettier
npm run format       # formata src/ e test/
```

## Variáveis de ambiente

Todas são opcionais e validadas no bootstrap: um valor inválido impede a aplicação de subir,
com mensagem explicando o problema.

| Variável              | Padrão               | Descrição                                            |
| --------------------- | -------------------- | ---------------------------------------------------- |
| `PORT`                | `3000`               | Porta HTTP da aplicação. Inteiro entre 1 e 65535.    |
| `MOVIELIST_CSV_PATH`  | `data/Movielist.csv` | Caminho do CSV carregado na inicialização.           |

Os valores podem ser definidos no ambiente ou em um arquivo `.env` na raiz do projeto.

```bash
MOVIELIST_CSV_PATH=data/Movielist.csv PORT=3000 npm run start:dev
```

## Endpoints

### `GET /producers/award-intervals`

Retorna os produtores com o menor (`min`) e o maior (`max`) intervalo entre duas vitórias
consecutivas. Cada lista traz todos os registros empatados, ordenados por `previousWin` e
depois por `producer`; um mesmo produtor pode aparecer nas duas listas. Produtores com uma
única vitória não entram no cálculo, e duas vitórias no mesmo ano geram intervalo 0. Sem
nenhum intervalo possível, a resposta é `{ "min": [], "max": [] }`.

```bash
curl http://localhost:3000/producers/award-intervals
```

Resposta `200 OK` com `data/Movielist.csv`:

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

## Decisões técnicas

<!-- Preenchido conforme as decisões forem tomadas. -->
