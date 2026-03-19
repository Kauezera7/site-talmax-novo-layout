# Projeto Geral

## O Que E Este Projeto

O `site-talmax` tem duas partes principais:

- `frontend`
  Site publico + painel administrativo em React
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

- ```txt
  frontend/src/components/
  ```
  Paginas e componentes publicos
- ```txt
  frontend/src/pages/Admin/
  ```
  Painel admin
- ```txt
  frontend/src/context/
  ```
  Estado compartilhado
- ```txt
  frontend/src/hooks/
  ```
  Logica de carregamento e CRUD
- ```txt
  frontend/src/services/
  ```
  Comunicacao com a API
- ```txt
  backend/server.js
  ```
  Arquivo principal da API hoje
- ```txt
  backend/database_schema.sql
  ```
  Estrutura principal do banco

## Observacao Importante

O frontend ja esta mais modular.
O backend ja tem pastas preparadas, mas a maior parte da logica ainda esta centralizada em `server.js`.
