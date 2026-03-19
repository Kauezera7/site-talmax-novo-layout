# Backend

## Funcao

O backend responde as APIs usadas pelo frontend e conversa com o banco MySQL.

## Estrutura Atual

```txt
backend/
├── .env
├── database_schema.sql
├── list_categories.js
├── package.json
├── server.js
└── src/
    ├── config/
    │   └── database.js
    ├── controllers/
    ├── middleware/
    ├── models/
    ├── routes/
    ├── services/
    ├── scripts/
    │   ├── migrations/
    │   └── seeds/
    └── utils/
        ├── helpers.js
        └── queries.js
```

## Arquivos Mais Importantes

- `server.js`
  Centraliza as rotas e a lógica principal hoje.
- `src/config/database.js`
  Configuração da conexão com MySQL.
- `database_schema.sql`
  Script base de estrutura do banco.
- `src/utils/queries.js`
  Queries reutilizadas.

## APIs Principais

- `/api/categories`
- `/api/banners`
- `/api/products`
- endpoints das seções especiais como Upcera, Scanners e Impressoras

## Leitura Rápida

Se você quiser entender o backend pela primeira vez:

1. Abra `server.js`
2. Veja `database.js`
3. Depois veja `database_schema.sql`
