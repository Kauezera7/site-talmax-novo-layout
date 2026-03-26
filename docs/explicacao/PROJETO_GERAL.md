# Projeto Geral

## O Que E Este Projeto

O `site-talmax` tem duas partes principais:

- `frontend`
  Aplicacao React com o site publico e a interface do painel administrativo.
- `backend`
  API em Node.js com Express e MySQL, responsavel por autenticacao do admin, CRUD e upload de arquivos.

## Fluxo Geral

```txt
Frontend React
-> services do frontend
-> API Express (/api)
-> MySQL e armazenamento de imagens
```

## Estrutura Principal

```txt
site-talmax/
|-- backend/
|-- docs/
|-- frontend/
|-- .gitignore
|-- GEMINI.md
|-- KINGHOST_DEPLOY.md
|-- package.json
`-- package-lock.json
```

## Onde Fica Cada Parte

- `frontend/src/App.jsx`
  Define as rotas publicas e as rotas do admin.
- `frontend/src/components/`
  Componentes e paginas do site publico.
- `frontend/src/pages/Admin/`
  Estrutura visual e modulos do painel.
- `frontend/src/context/AdminContext.jsx`
  Estado compartilhado do painel.
- `frontend/src/hooks/`
  Carregamento e CRUD das entidades administrativas.
- `frontend/src/services/`
  Comunicacao HTTP com a API.
- `backend/server.js`
  Ponto de entrada do backend e bootstrap de ambiente.
- `backend/src/server/app.js`
  Montagem do app Express, middlewares, arquivos estaticos e rotas.
- `backend/src/server/routes/`
  Rotas da API.
- `backend/src/server/services/`
  Regras reutilizadas do backend.
- `backend/src/config/database.js`
  Conexao com MySQL.
- `backend/database_schema.sql`
  Estrutura base do banco.

## Como O Projeto Funciona Hoje

- O frontend e buildado com Vite.
- O backend tambem serve o `frontend/dist` em producao.
- O admin usa autenticacao por sessao HTTP.
- Uploads passam pelo backend e podem usar armazenamento local ou Cloudinary, dependendo das variaveis de ambiente.
- As secoes especiais do site, como Upcera, Scanners e Impressoras 3D, sao configuradas pelo admin e persistidas no banco.

## Observacao Importante

O backend nao esta mais concentrado apenas em `server.js`.
Hoje `server.js` inicializa o ambiente e sobe o servidor, enquanto a composicao das rotas e middlewares fica em `backend/src/server/app.js` e nos arquivos dentro de `backend/src/server/`.
