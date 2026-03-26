# Backend

## Funcao

O backend expoe a API usada pelo frontend, valida sessao do admin, faz CRUD no MySQL e trata upload de imagens.

## Estrutura Atual

```txt
backend/
|-- .env
|-- database_schema.sql
|-- list_categories.js
|-- package.json
|-- server.js
|-- storage/
|   `-- img/
`-- src/
    |-- config/
    |   `-- database.js
    |-- scripts/
    |   `-- migrations/
    |-- server/
    |   |-- app.js
    |   |-- auth/
    |   |-- config/
    |   |-- routes/
    |   |-- services/
    |   `-- utils/
    `-- utils/
```

## Como O Backend Esta Organizado Hoje

- `server.js`
  Carrega variaveis de ambiente e sobe o servidor HTTP.
- `src/server/app.js`
  Monta a aplicacao Express e registra:
  - CORS
  - `express.json()`
  - servico de `/img`
  - servico de `frontend/dist`
  - rotas da API
- `src/server/routes/`
  Endpoints separados por dominio.
- `src/server/auth/adminSession.js`
  Login do admin, middleware de sessao, leitura de sessao e logout.
- `src/server/config/upload.js`
  Configuracao de upload com Multer.
- `src/server/services/fileStorageService.js`
  Persistencia de arquivos enviados.
- `src/config/database.js`
  Pool de conexoes MySQL.

## Endpoints Principais

- `/api/admin/login`
- `/api/admin/session`
- `/api/admin/logout`
- `/api/categories`
- `/api/banners`
- `/api/products`
- `/api/upcera/products`
- `/api/scanners/products`
- `/api/3d-printers/products`

## Regras Importantes Do Servidor

- O backend serve `frontend/dist` em producao.
- Requisicoes `GET` fora de `/api` caem no `index.html` do frontend.
- Uploads sao limitados e tratados com resposta amigavel quando falham.
- Imagens ficam expostas em `/img`.
- Variaveis do Cloudinary definem se o storage sera remoto ou local.

## Scripts NPM

Os scripts do backend hoje sao:

- `npm start`
  Inicia o servidor com `node server.js`
- `npm run dev`
  Executa `setup-development.js` e sobe o servidor
- `npm run dev:check`
  Executa `debug-storage.js`

## Leitura Rapida

Se voce quiser entender o backend pela primeira vez:

1. Abra `backend/server.js`
2. Abra `backend/src/server/app.js`
3. Veja `backend/src/server/routes/`
4. Veja `backend/src/config/database.js`
5. Consulte `backend/database_schema.sql`
