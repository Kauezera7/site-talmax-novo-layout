# Projeto Geral

## O Que E Este Projeto

O `site-talmax` tem duas partes principais:

- `frontend`
  Site público + painel administrativo em React
- `backend`
  API em Node.js + MySQL

## Fluxo Geral

```txt
Frontend
-> Services
-> API do backend
-> Banco de dados
```

## Estrutura Principal

```txt
site-talmax/
├── backend/
├── docs/
├── frontend/
├── .gitignore
├── GEMINI.md
└── package-lock.json
```

## Onde Fica Cada Parte

- `frontend/src/components/`
  Páginas e componentes públicos
- `frontend/src/pages/Admin/`
  Painel admin
- `frontend/src/context/`
  Estado compartilhado
- `frontend/src/hooks/`
  Lógica de carregamento e CRUD
- `frontend/src/services/`
  Comunicação com a API
- `backend/server.js`
  Arquivo principal da API hoje
- `backend/database_schema.sql`
  Estrutura principal do banco

## Observacao Importante

O frontend já está mais modular.
O backend já tem pastas preparadas, mas a maior parte da lógica ainda está centralizada em `server.js`.
