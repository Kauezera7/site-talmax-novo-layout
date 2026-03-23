# Deploy na KingHost

Este projeto pode ser publicado na KingHost usando hospedagem Node.js com MySQL.

## Tabelas verificadas no banco

O schema atual do projeto usa estas tabelas em `backend/database_schema.sql`:

- `categorias`
- `sub_categorias`
- `products`
- `product_categorias`
- `product_sub_categorias`
- `banners`
- `users`
- `page_settings`

## Estrutura de deploy

- O frontend React deve ser buildado em `frontend/dist`
- O backend Express serve o build do frontend e as rotas `/api`
- Em producao, o frontend usa `/api` no mesmo dominio

## Passo a passo

1. Crie uma hospedagem Node.js na KingHost.
2. Crie um banco MySQL no painel da KingHost.
3. Importe o arquivo `backend/database_schema.sql` no banco criado.
4. Gere o build do frontend:

```powershell
cd frontend
npm install
npm run build
```

5. No backend, instale as dependencias:

```powershell
cd ../backend
npm install
```

6. Crie o arquivo `.env` no backend baseado em `backend/.env.example`.
7. Ajuste as variaveis de ambiente com os dados reais da KingHost.
8. Suba os arquivos do projeto para a hospedagem.
9. Configure o start da aplicacao Node.js com:

```bash
npm start
```

## Variaveis importantes

Exemplo de `.env` para producao:

```env
DB_HOST=seu_host_mysql
DB_USER=seu_usuario_mysql
DB_PASSWORD=sua_senha_mysql
DB_NAME=site-talmax
PORT=5000
NODE_ENV=production
ADMIN_JWT_SECRET=uma_chave_bem_forte_e_longa
ADMIN_JWT_EXPIRES_IN_SECONDS=28800
CORS_ALLOWED_ORIGINS=https://seudominio.com.br,https://www.seudominio.com.br
```

## Observacoes

- Se frontend e backend estiverem no mesmo dominio, `VITE_API_URL` nao precisa ser definido.
- As imagens enviadas pelo painel sao gravadas em `frontend/public/img`.
- O arquivo `backend/database_schema.sql` ja contem a estrutura principal e dados iniciais.
