# Site Talmax

Documentação principal do projeto `site-talmax`.

## Visão Geral

O projeto é composto por:

- `frontend/`
  Aplicação React com Vite que entrega o site público e a interface do painel administrativo.
- `backend/`
  API em Node.js com Express e MySQL, responsável por autenticação do admin, CRUD de conteúdo, upload de imagens e entrega do build do frontend em produção.
- `docs/`
  Documentação complementar de arquitetura, API, deploy e mapas rápidos.

## O Que O Sistema Faz

- publica o site institucional da Talmax
- lista produtos e categorias
- exibe páginas especiais como Upcera, Scanners e Impressoras 3D
- permite administrar produtos, categorias, banners e seleções especiais pelo painel
- persiste dados em MySQL
- faz upload de imagens com armazenamento local, Cloudinary ou SFTP

## Estrutura Resumida

```txt
site-talmax/
|-- backend/
|-- docs/
|-- frontend/
|-- README.md
|-- GEMINI.md
`-- KINGHOST_DEPLOY.md
```

## Arquitetura Em Alto Nível

```txt
Frontend React
-> services do frontend
-> API Express (/api)
-> MySQL + storage de imagens
```

Em produção, o backend também serve:

- `frontend/dist`
- arquivos em `/img`

## Frontend

Tecnologias principais:

- React 19
- React Router 7
- Vite
- Framer Motion
- Lucide React

Arquivos centrais:

- `frontend/src/main.jsx`
  inicializa a aplicação React
- `frontend/src/App.jsx`
  concentra rotas, layout público, busca, proteção de rotas do admin e tema do painel
- `frontend/src/services/`
  integra o frontend com a API
- `frontend/src/pages/Admin/`
  implementa o painel administrativo

Rotas públicas principais:

- `/`
- `/quem-somos`
- `/historia-diretoria`
- `/produtos`
- `/categoria/:slug`
- `/produto/:id`
- `/upcera`
- `/scanners`
- `/impressoras-3d`
- `/suporte`

Rotas do admin:

- `/admin/login`
- `/admin/painel`

## Backend

Tecnologias principais:

- Node.js
- Express 5
- MySQL2
- Multer
- Cloudinary
- SSH2 SFTP Client

Arquivos centrais:

- `backend/server.js`
  ponto de entrada do servidor
- `backend/src/server/app.js`
  composição da aplicação Express
- `backend/src/server/routes/`
  endpoints da API
- `backend/src/server/auth/adminSession.js`
  login, sessão e middleware de proteção
- `backend/src/config/database.js`
  pool do MySQL

Endpoints principais:

- `/api/admin/login`
- `/api/admin/session`
- `/api/admin/logout`
- `/api/categories`
- `/api/banners`
- `/api/products`
- `/api/upcera/products`
- `/api/scanners/products`
- `/api/3d-printers/products`

## Banco de Dados

O schema base fica em:

- `backend/database_schema.sql`

Tabelas principais:

- `categorias`
- `sub_categorias`
- `products`
- `product_categorias`
- `product_sub_categorias`
- `banners`
- `users`
- `page_settings`

Observação importante:

- o schema atual inclui um usuário inicial `admin`
- no estado atual do arquivo SQL, a senha inicial é `talmax123`
- isso deve ser trocado em qualquer ambiente real

## Storage de Imagens

O fluxo atual de imagens funciona assim:

1. o upload entra pelo backend usando Multer
2. o backend salva inicialmente em `backend/storage/img` ou no diretório definido por `UPLOAD_DIR`
3. a persistência final pode seguir três caminhos:
   - Cloudinary, se as variáveis `CLOUDINARY_*` existirem
   - SFTP, se as variáveis `SFTP_*` existirem
   - armazenamento local, se nada remoto estiver configurado
4. a API expõe imagens por `/img/...`

Compatibilidade legada:

- o backend ainda serve `frontend/public/img` para imagens antigas publicadas antes da mudança de arquitetura

## Variáveis de Ambiente

Arquivo de referência:

- `backend/.env.example`

Variáveis essenciais:

- `DB_HOST`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `PORT`
- `NODE_ENV`
- `ADMIN_JWT_SECRET`
- `ADMIN_JWT_EXPIRES_IN_SECONDS`
- `CORS_ALLOWED_ORIGINS`

Variáveis opcionais de storage:

- `UPLOAD_DIR`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_FOLDER`
- `SFTP_HOST`
- `SFTP_PORT`
- `SFTP_USER`
- `SFTP_PASSWORD`
- `SFTP_REMOTE_DIR`
- `SFTP_PUBLIC_BASE_URL`

## Como Rodar em Desenvolvimento

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Por padrão, o frontend usa:

- `http://localhost:5000/api` em desenvolvimento

### Backend

```powershell
cd backend
npm install
npm start
```

Antes de iniciar o backend:

1. crie o banco MySQL
2. importe `backend/database_schema.sql`
3. crie `backend/.env` baseado em `backend/.env.example`

## Scripts

### Frontend

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run lint`

### Backend

- `npm start`
  script confiável atual para subir o servidor
- `npm run dev`
  hoje está apontando para `setup-development.js`, mas esse arquivo não está presente no repositório atual
- `npm run dev:check`
  hoje está apontando para `debug-storage.js`, mas esse arquivo não está presente no repositório atual

Se esses arquivos auxiliares não forem restaurados, prefira usar `npm start`.

## Painel Administrativo

Fluxo do painel:

```txt
AdminLogin
-> /api/admin/login
-> cookie de sessão HTTP-only

AdminDashboard
-> AdminContext
-> hooks
-> services
-> endpoints protegidos
```

Módulos internos:

- produtos
- categorias
- banners
- Upcera
- Scanners
- Impressoras 3D

## Documentação Complementar

- [API do Projeto](/c:/Users/ti6/Desktop/Desvolvimento/site-talmax/docs/API.md)
- [Arquitetura e Operação](/c:/Users/ti6/Desktop/Desvolvimento/site-talmax/docs/ARQUITETURA_E_OPERACAO.md)
- [Mapa da Estrutura](/c:/Users/ti6/Desktop/Desvolvimento/site-talmax/docs/MAPA_ESTRUTURA_PROJETO.md)
- [Guia rápido de explicação](/c:/Users/ti6/Desktop/Desvolvimento/site-talmax/docs/explicacao/README.md)
- [Deploy na KingHost](/c:/Users/ti6/Desktop/Desvolvimento/site-talmax/KINGHOST_DEPLOY.md)

## Pontos de Atenção Atuais

- `frontend/vite.config.js` usa `base: '/site-talmax/'`, o que impacta o deploy do frontend
- o backend exige `ADMIN_JWT_SECRET` e `DB_PASSWORD` para iniciar
- o schema SQL atual cria um admin padrão; troque a senha em ambiente real
- os scripts `backend` `dev` e `dev:check` referenciam arquivos ausentes no estado atual do repositório
