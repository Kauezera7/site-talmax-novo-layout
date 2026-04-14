# Guia rapido para IA

Documento curto para agentes entenderem o estado atual do projeto sem depender de documentacao antiga.

## O que e este repositorio

O projeto entrega:

- site institucional da Talmax
- catalogo de produtos
- painel administrativo
- paginas especiais e paginas dinamicas gerenciadas pelo admin

## Stack atual

- frontend: React 19 + Vite 8 + React Router 7 + Mantine
- backend: Node.js + Express 5
- banco: MySQL
- upload: Multer com persistencia local, Cloudinary ou SFTP

## Onde mexer

- rotas e layout principal: `frontend/src/App.jsx`
- painel admin: `frontend/src/pages/Admin/AdminDashboard.jsx`
- estado global do admin: `frontend/src/context/AdminContext.jsx`
- services do frontend: `frontend/src/services/`
- rotas do backend: `backend/src/server/routes/`
- bootstrap do backend: `backend/src/server/app.js`
- banco base: `backend/database_schema.sql`

## Dominios importantes da API

- `/api/admin`
- `/api/categories`
- `/api/banners`
- `/api/products`
- `/api/home-services`
- `/api/page-settings`
- `/api/custom-pages`
- `/api/digital-groups`
- `/api/upcera/products`
- `/api/scanners/products`
- `/api/3d-printers/products`
- `/api/featured-products`

## Regras que pegam facil

1. Upload novo nao deve depender de `frontend/public/img`.
   O caminho atual passa pelo backend e usa `backend/storage/img` ou `UPLOAD_DIR`.
2. O backend ainda serve `frontend/public/img` e `frontend/dist/img` por compatibilidade com arquivos antigos.
3. O build do frontend usa `base: '/site-talmax/'`.
4. O painel nao usa subrotas internas. Ele troca modulo por estado dentro de `AdminDashboard.jsx`.
5. Parte do schema e criada por runtime ou migrations, entao nem tudo esta somente no `database_schema.sql`.
6. `backend/package.json` ainda tem scripts antigos quebrados. Para subir o projeto, prefira `npm start`.

## Como rodar

Backend:

```powershell
cd backend
npm install
npm start
```

Frontend:

```powershell
cd frontend
npm install
npm run dev
```

Antes disso:

1. criar o banco
2. importar `backend/database_schema.sql`
3. criar `backend/.env` a partir de `backend/.env.example`
