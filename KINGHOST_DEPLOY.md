# Deploy na KingHost

Guia rapido para publicar o projeto com backend Node.js, frontend buildado e MySQL.

## Resumo da arquitetura de producao

- o frontend deve ser buildado em `frontend/dist`
- o backend Express serve `frontend/dist`
- a API fica em `/api`
- as imagens ficam em `/img`
- o banco e MySQL

## Checklist antes do deploy

1. Criar o banco MySQL da hospedagem.
2. Importar `backend/database_schema.sql`.
3. Revisar migrations extras se o ambiente ainda nao tiver tabelas recentes.
4. Criar `backend/.env`.
5. Definir `ADMIN_BOOTSTRAP_*` para criar o primeiro admin com senha hasheada.
6. Rodar o build do frontend.
7. Instalar as dependencias do backend.

## Build do frontend

```powershell
cd frontend
npm install
npm run build
```

Saida esperada:

- `frontend/dist`

## Backend de producao

```powershell
cd backend
npm install
npm start
```

Use `npm start` para subir o servidor. Os scripts `npm run dev` e `npm run dev:check` apontam para arquivos que nao existem no repositorio atual.

## Variaveis de ambiente

Use `backend/.env.example` como base.

Exemplo minimo:

```env
DB_HOST=seu_host_mysql
DB_USER=seu_usuario_mysql
DB_PASSWORD=sua_senha_mysql
DB_NAME=site-talmax
PORT=5000
NODE_ENV=production
ADMIN_JWT_SECRET=uma_chave_forte
ADMIN_JWT_EXPIRES_IN_SECONDS=28800
CORS_ALLOWED_ORIGINS=https://seudominio.com.br,https://www.seudominio.com.br
ADMIN_BOOTSTRAP_USERNAME=admin.master
ADMIN_BOOTSTRAP_PASSWORD=uma_senha_forte_e_unica
ADMIN_BOOTSTRAP_EMAIL=admin@seudominio.com.br
ADMIN_BOOTSTRAP_FULL_NAME=Administrador Talmax
```

Se for usar storage remoto, complete tambem:

- `CLOUDINARY_*`
- ou `SFTP_*`

Depois que o primeiro admin entrar no painel:

- remova `ADMIN_BOOTSTRAP_PASSWORD`
- remova as outras `ADMIN_BOOTSTRAP_*` se nao quiser manter esse bootstrap disponivel

## Imagens e storage

Fluxo atual:

- uploads entram pelo backend
- o destino local principal e `backend/storage/img`, a menos que `UPLOAD_DIR` esteja definido
- Cloudinary tem prioridade quando configurado
- SFTP entra como alternativa remota quando Cloudinary nao estiver ativo
- `frontend/public/img` e `frontend/dist/img` seguem apenas como fontes legadas para arquivos antigos

Se a hospedagem nao tiver disco persistente, prefira Cloudinary ou SFTP.

## Ponto de atencao no build do frontend

O `vite.config.js` agora usa a variavel `VITE_PUBLIC_BASE_PATH`.

Sem essa variavel, o build sai para raiz:

```js
base: '/'
```

Se o deploy final usar um subdiretorio, defina isso antes do build. Exemplo:

```powershell
$env:VITE_PUBLIC_BASE_PATH='/site-talmax/'
npm run build
```

Se a base ficar errada, links e assets como `/img/Talmaxlogo.webp` podem quebrar em producao.

Observacao:

- neste repositorio, `frontend/.env.production` ja fixa `VITE_PUBLIC_BASE_PATH=/site-talmax/`

## URLs esperadas em producao

- frontend: servido pelo backend
- API: `/api`
- imagens: `/img`
- login admin: `/admin/login`
- painel admin: `/admin/painel`

## Validacao final

- app sobe com `npm start`
- frontend abre sem erro de asset
- `/api` responde
- `/img/...` responde
- login do admin funciona
- CORS cobre o dominio real
