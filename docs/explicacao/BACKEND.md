# Backend

## Função

O backend expõe a API usada pelo frontend, valida sessão do admin, faz CRUD no MySQL e trata upload de imagens.

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

## Como o Backend Está Organizado Hoje

- `server.js`
  Carrega variáveis de ambiente e sobe o servidor HTTP.
- `src/server/app.js`
  Monta a aplicação Express e registra:
  - CORS
  - `express.json()`
  - serviço de `/img`
  - serviço de `frontend/dist`
  - rotas da API
- `src/server/routes/`
  Endpoints separados por domínio.
- `src/server/auth/adminSession.js`
  Login do admin, middleware de sessão, leitura de sessão e logout.
- `src/server/config/upload.js`
  Configuração de upload com Multer.
- `src/server/services/fileStorageService.js`
  Persistência de arquivos enviados.
- `src/config/database.js`
  Pool de conexões MySQL.

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

## Regras Importantes do Servidor

- O backend serve `frontend/dist` em produção.
- Requisições `GET` fora de `/api` caem no `index.html` do frontend.
- Uploads são limitados e tratados com resposta amigável quando falham.
- Imagens ficam expostas em `/img`.
- Variáveis do Cloudinary definem se o storage será remoto ou local.

## Scripts NPM

Os scripts do backend hoje são:

- `npm start`
  Inicia o servidor com `node server.js`
- `npm run dev`
  Está configurado para executar `setup-development.js` e subir o servidor, mas esse arquivo não está presente no repositório atual
- `npm run dev:check`
  Está configurado para executar `debug-storage.js`, mas esse arquivo não está presente no repositório atual

Para subir o backend sem dependências ausentes, prefira `npm start`.

## Leitura Rápida

Se você quiser entender o backend pela primeira vez:

1. Abra `backend/server.js`
2. Abra `backend/src/server/app.js`
3. Veja `backend/src/server/routes/`
4. Veja `backend/src/config/database.js`
5. Consulte `backend/database_schema.sql`
