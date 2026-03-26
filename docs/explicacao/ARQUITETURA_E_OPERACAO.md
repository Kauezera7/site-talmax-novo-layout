# Arquitetura e Operação

Este documento consolida a forma como o projeto está organizado, configurado e operado hoje.

## Pastas Principais

```txt
backend/
frontend/
docs/
```

## Fluxo da Aplicação

### Site Público

```txt
Usuario
-> React Router
-> componentes públicos
-> fetch para /api/products e /api/categories
-> backend
-> MySQL
```

### Painel Administrativo

```txt
AdminLogin
-> POST /api/admin/login
-> cookie HTTP-only
-> /admin/painel
-> hooks e services do admin
-> endpoints protegidos
-> MySQL + storage
```

## Frontend

Pontos principais:

- o router principal está em `frontend/src/App.jsx`
- o painel não usa subrotas por módulo; a navegação interna acontece por estado local no dashboard
- o frontend usa `VITE_API_URL` quando definido
- em desenvolvimento, o fallback da API é `http://localhost:5000/api`
- em produção, o fallback da API é `/api`

### Base do Frontend

O arquivo `frontend/vite.config.js` usa:

```js
base: '/site-talmax/'
```

Isso impacta:

- caminhos de assets
- deploy em subdiretório
- comportamento do router em produção

Se o deploy final não usar `/site-talmax/`, essa configuração deve ser revisada.

## Backend

### Entrada

- `backend/server.js`
  carrega variáveis de ambiente e sobe o servidor

### Composição

- `backend/src/server/app.js`
  registra CORS, JSON, `/img`, frontend estático e rotas da API

### Domínios da API

- `adminAuthRoutes.js`
- `categoryRoutes.js`
- `bannerRoutes.js`
- `productRoutes.js`
- `specialSectionRoutes.js`

### Banco

- `backend/src/config/database.js`
  cria um pool MySQL

O backend não inicia sem:

- `DB_PASSWORD`
- `ADMIN_JWT_SECRET`

## Autenticação do Admin

Implementação em:

- `backend/src/server/auth/adminSession.js`

Características:

- login via usuário e senha
- cookie `talmax-admin-session`
- sessão assinada com HMAC SHA-256
- expiração padrão de 8 horas
- `httpOnly`
- `sameSite=lax` em desenvolvimento
- `sameSite=none` e `secure=true` em produção

## Upload e Storage

### Entrada de Upload

Implementação em:

- `backend/src/server/config/upload.js`

Regras:

- tipos permitidos: `image/jpeg`, `image/png`, `image/webp`, `image/gif`, `image/svg+xml`
- limite por arquivo: 5 MB
- máximo de arquivos: 20

### Resolução de Pastas

Implementação em:

- `backend/src/server/config/imageStorage.js`

Ordem atual:

1. `UPLOAD_DIR`, se definido
2. `backend/storage/img`

Compatibilidade:

- `frontend/public/img` continua sendo servido como pasta legada para imagens antigas

### Persistência Final

Implementação em:

- `backend/src/server/services/fileStorageService.js`

Prioridade de storage:

1. Cloudinary
2. SFTP
3. local

Variáveis usadas:

- Cloudinary:
  `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_FOLDER`
- SFTP:
  `SFTP_HOST`, `SFTP_PORT`, `SFTP_USER`, `SFTP_PASSWORD`, `SFTP_REMOTE_DIR`, `SFTP_PUBLIC_BASE_URL`
- local:
  `UPLOAD_DIR`

## CORS

Implementação em:

- `backend/src/server/config/cors.js`

Origens padrão atuais:

- `http://localhost:5173`
- `http://127.0.0.1:5173`
- `http://localhost:4173`
- `http://127.0.0.1:4173`
- `https://talmax-ti.com.br`
- `https://www.talmax-ti.com.br`
- `https://site-talmax.onrender.com`

Expansão por ambiente:

- `CORS_ALLOWED_ORIGINS`

Formato esperado:

- lista separada por vírgula

## Banco de Dados

Schema base:

- `backend/database_schema.sql`

Entidades centrais:

- categorias e subcategorias
- produtos
- relações produto x categoria
- banners
- usuários
- configurações de página

O arquivo SQL também insere dados iniciais e um admin padrão.

## Scripts e Operação

### Frontend

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run lint`

### Backend

- `npm start`
  funciona no estado atual
- `npm run dev`
  referencia `setup-development.js`, ausente no repositório atual
- `npm run dev:check`
  referencia `debug-storage.js`, ausente no repositório atual

## Sequência Recomendada para Subir o Projeto

1. importar `backend/database_schema.sql` no MySQL
2. criar `backend/.env`
3. instalar dependências do backend
4. subir backend com `npm start`
5. instalar dependências do frontend
6. subir frontend com `npm run dev`

## Riscos e Pontos de Atenção

- o usuário admin padrão do schema precisa ser trocado em ambiente real
- os scripts auxiliares do backend referenciam arquivos ausentes
- o `base` do Vite está fixado em `/site-talmax/`
- storage local sem disco persistente pode perder imagens em alguns ambientes de hospedagem
