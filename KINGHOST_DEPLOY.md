# Deploy na KingHost

Este guia foi atualizado para refletir a arquitetura atual do projeto em 26 de março de 2026.

## Resumo da Arquitetura de Produção

- o frontend deve ser buildado em `frontend/dist`
- o backend Express serve a pasta `frontend/dist`
- a API fica sob `/api`
- as imagens são servidas por `/img`
- o banco usado pelo projeto é MySQL

## Antes de Publicar

Confirme estes pontos:

1. o banco MySQL da hospedagem foi criado
2. `backend/database_schema.sql` foi importado
3. `backend/.env` foi configurado
4. o frontend foi buildado
5. as dependências do backend foram instaladas
6. a senha do admin padrão foi trocada

## Build do Frontend

```powershell
cd frontend
npm install
npm run build
```

Ao final, a pasta usada em produção será:

- `frontend/dist`

## Instalação do Backend

```powershell
cd backend
npm install
```

Script de início recomendado:

```bash
npm start
```

Observação:

- os scripts `npm run dev` e `npm run dev:check` do backend apontam para arquivos que não estão presentes no repositório atual

## Variáveis de Ambiente

Use [backend/.env.example](/c:/Users/ti6/Desktop/Desvolvimento/site-talmax/backend/.env.example) como base.

Exemplo mínimo:

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

## Storage de Imagens em Produção

O fluxo atual de imagens não deve mais ser documentado como dependente de `frontend/public/img`.

Hoje o projeto funciona assim:

- uploads entram pelo backend
- o destino local principal é `backend/storage/img`
- se `UPLOAD_DIR` estiver definido, ele passa a ser o destino local principal
- se Cloudinary estiver configurado, o backend prioriza Cloudinary
- se SFTP estiver configurado, o backend prioriza SFTP quando Cloudinary não estiver ativo
- `frontend/public/img` continua apenas como pasta legada para imagens antigas

Em hospedagens com filesystem não persistente, prefira:

- Cloudinary
ou
- SFTP

## Observações sobre o Frontend

O arquivo `frontend/vite.config.js` usa:

```js
base: '/site-talmax/'
```

Se a aplicação for publicada em um caminho diferente, ajuste esse valor antes do build.

## URLs Esperadas em Produção

- frontend: servido pelo próprio backend
- API: `/api`
- imagens: `/img`
- login admin: `/admin/login`
- painel admin: `/admin/painel`

## Checklist Final

- banco importado com sucesso
- `.env` criado
- `ADMIN_JWT_SECRET` definido
- senha do admin inicial alterada
- frontend buildado
- backend com `npm install`
- aplicação iniciando com `npm start`
