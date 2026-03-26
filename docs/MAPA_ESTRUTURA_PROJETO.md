# Mapa Da Estrutura Do Projeto

Este documento mostra a estrutura principal do projeto `site-talmax` com foco nas pastas que entram na manutencao do codigo.

## Estrutura Principal

```txt
site-talmax/
|-- backend/
|   |-- .env
|   |-- database_schema.sql
|   |-- list_categories.js
|   |-- package.json
|   |-- server.js
|   |-- storage/
|   |   `-- img/
|   `-- src/
|       |-- config/
|       |   `-- database.js
|       |-- scripts/
|       |   `-- migrations/
|       `-- server/
|           |-- app.js
|           |-- auth/
|           |-- config/
|           |-- routes/
|           |-- services/
|           `-- utils/
|-- docs/
|   |-- MAPA_ESTRUTURA_PROJETO.md
|   `-- explicacao/
|-- frontend/
|   |-- .env.production
|   |-- index.html
|   |-- package.json
|   |-- vite.config.js
|   |-- public/
|   |   `-- img/
|   |-- dist/
|   `-- src/
|       |-- App.jsx
|       |-- App.css
|       |-- main.jsx
|       |-- components/
|       |-- context/
|       |-- hooks/
|       |-- pages/
|       |-- services/
|       `-- utils/
|-- .gitignore
|-- GEMINI.md
|-- KINGHOST_DEPLOY.md
|-- package.json
`-- package-lock.json
```

## Backend

- `backend/server.js`
  Entrada do servidor. Carrega `.env`, cria a app Express e inicia o listener.
- `backend/src/server/app.js`
  Registra CORS, JSON, `/img`, `frontend/dist` e todas as rotas `/api`.
- `backend/src/server/auth/`
  Autenticacao e protecao de sessao do admin.
- `backend/src/server/config/`
  CORS, upload e resolucao de diretorios de imagem.
- `backend/src/server/routes/`
  Endpoints de admin, banners, categorias, produtos e secoes especiais.
- `backend/src/server/services/`
  Regras auxiliares, principalmente de produto e persistencia de arquivos.
- `backend/src/server/utils/`
  Parsers e funcoes utilitarias das rotas.
- `backend/src/config/database.js`
  Pool do MySQL.
- `backend/src/scripts/migrations/`
  Scripts manuais de evolucao do schema.

## Frontend

- `frontend/src/App.jsx`
  Router principal do site e do painel.
- `frontend/src/components/`
  Componentes e paginas publicas.
- `frontend/src/components/AdminLogin/`
  Tela de login do painel.
- `frontend/src/pages/Admin/`
  Dashboard do painel e modulos internos.
- `frontend/src/context/AdminContext.jsx`
  Estado compartilhado do admin.
- `frontend/src/hooks/`
  Hooks de banners, categorias e produtos.
- `frontend/src/services/`
  API base, autenticacao admin e CRUD.
- `frontend/src/utils/assets.js`
  Resolve caminhos de assets.
- `frontend/src/utils/productCategories.js`
  Regras auxiliares de categorias no frontend.

## Rotas Importantes

- Frontend publico:
  `/`, `/quem-somos`, `/historia-diretoria`, `/produtos`, `/categoria/:slug`, `/produto/:id`, `/upcera`, `/scanners`, `/impressoras-3d`, `/suporte`
- Admin:
  `/admin/login` e `/admin/painel`
- API:
  `/api/admin`, `/api/categories`, `/api/banners`, `/api/products`, `/api/upcera/products`, `/api/scanners/products`, `/api/3d-printers/products`

## Regra Rapida Para Se Achar

- Quer mexer em rotas da interface:
  `frontend/src/App.jsx`
- Quer mexer em pagina publica:
  `frontend/src/components/NOME_DA_PASTA/`
- Quer mexer em login do admin:
  `frontend/src/components/AdminLogin/`
- Quer mexer em uma area do painel:
  `frontend/src/pages/Admin/`
- Quer mexer em chamadas HTTP do frontend:
  `frontend/src/services/`
- Quer mexer em estado compartilhado do admin:
  `frontend/src/context/AdminContext.jsx`
- Quer mexer em endpoints:
  `backend/src/server/routes/`
- Quer mexer na montagem geral do servidor:
  `backend/src/server/app.js`
- Quer mexer em banco:
  `backend/database_schema.sql`
