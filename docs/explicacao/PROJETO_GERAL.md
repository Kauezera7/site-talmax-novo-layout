# Projeto Geral

## O Que É Este Projeto

O `site-talmax` tem duas partes principais:

- `frontend`
  Aplicação React com o site público e a interface do painel administrativo.
- `backend`
  API em Node.js com Express e MySQL, responsável por autenticação do admin, CRUD e upload de arquivos.

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
  Define as rotas públicas e as rotas do admin.
- `frontend/src/components/`
  Componentes e páginas do site público.
- `frontend/src/pages/Admin/`
  Estrutura visual e módulos do painel.
- `frontend/src/context/AdminContext.jsx`
  Estado compartilhado do painel.
- `frontend/src/hooks/`
  Carregamento e CRUD das entidades administrativas.
- `frontend/src/services/`
  Comunicação HTTP com a API.
- `backend/server.js`
  Ponto de entrada do backend e bootstrap de ambiente.
- `backend/src/server/app.js`
  Montagem do app Express, middlewares, arquivos estáticos e rotas.
- `backend/src/server/routes/`
  Rotas da API.
- `backend/src/server/services/`
  Regras reutilizadas do backend.
- `backend/src/config/database.js`
  Conexão com MySQL.
- `backend/database_schema.sql`
  Estrutura base do banco.

## Como O Projeto Funciona Hoje

- O frontend é buildado com Vite.
- O backend também serve o `frontend/dist` em produção.
- O admin usa autenticação por sessão HTTP.
- Uploads passam pelo backend e podem usar armazenamento local ou Cloudinary, dependendo das variáveis de ambiente.
- As seções especiais do site, como Upcera, Scanners e Impressoras 3D, são configuradas pelo admin e persistidas no banco.

## Observação Importante

O backend não está mais concentrado apenas em `server.js`.
Hoje `server.js` inicializa o ambiente e sobe o servidor, enquanto a composição das rotas e middlewares fica em `backend/src/server/app.js` e nos arquivos dentro de `backend/src/server/`.
