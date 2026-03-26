# Documentacao Do Painel Admin

Este arquivo resume a organizacao do painel administrativo do projeto.

## Entrada E Rotas

- componente principal:
  [AdminDashboard.jsx](/c:/Users/ti6/Desktop/Desvolvimento/site-talmax/frontend/src/pages/Admin/AdminDashboard.jsx)
- rota de login:
  `/admin/login`
- rota protegida:
  `/admin/painel`

## Estrutura

```txt
frontend/src/pages/Admin/
|-- AdminDashboard.jsx
|-- AdminBase.css
|-- AdminProducts/
|-- AdminCategories/
|-- AdminBanners/
|-- AdminUpcera/
|-- AdminScanners/
`-- AdminPrinters/
```

## Como O Painel Funciona

```txt
AdminLogin.jsx
-> adminAuth.js
-> /api/admin/login

AdminDashboard.jsx
-> AdminProvider
-> AdminContext.jsx
-> hooks
-> services
-> backend
```

## Arquivos Importantes

- [AdminDashboard.jsx](/c:/Users/ti6/Desktop/Desvolvimento/site-talmax/frontend/src/pages/Admin/AdminDashboard.jsx)
  Layout principal, menu lateral, trocas de aba e logout.
- [AdminBase.css](/c:/Users/ti6/Desktop/Desvolvimento/site-talmax/frontend/src/pages/Admin/AdminBase.css)
  Estilos compartilhados do admin.
- [AdminContext.jsx](/c:/Users/ti6/Desktop/Desvolvimento/site-talmax/frontend/src/context/AdminContext.jsx)
  Estado compartilhado para produtos, categorias, banners, loading, erro e toasts.
- [adminAuth.js](/c:/Users/ti6/Desktop/Desvolvimento/site-talmax/frontend/src/services/adminAuth.js)
  Login, validacao de sessao e logout.

## Modulos

- [AdminProducts](/c:/Users/ti6/Desktop/Desvolvimento/site-talmax/frontend/src/pages/Admin/AdminProducts)
  CRUD de produtos.
- [AdminCategories](/c:/Users/ti6/Desktop/Desvolvimento/site-talmax/frontend/src/pages/Admin/AdminCategories)
  CRUD de categorias e subcategorias.
- [AdminBanners](/c:/Users/ti6/Desktop/Desvolvimento/site-talmax/frontend/src/pages/Admin/AdminBanners)
  CRUD de banners.
- [AdminUpcera](/c:/Users/ti6/Desktop/Desvolvimento/site-talmax/frontend/src/pages/Admin/AdminUpcera)
  Selecao de produtos da pagina Upcera.
- [AdminScanners](/c:/Users/ti6/Desktop/Desvolvimento/site-talmax/frontend/src/pages/Admin/AdminScanners)
  Selecao de produtos da pagina Scanners.
- [AdminPrinters](/c:/Users/ti6/Desktop/Desvolvimento/site-talmax/frontend/src/pages/Admin/AdminPrinters)
  Selecao de produtos da pagina Impressoras 3D.

## Observacoes

- O painel nao usa sub-rotas internas por modulo; a troca entre areas acontece por estado em `AdminDashboard.jsx`.
- O acesso depende de sessao valida retornada por `/api/admin/session`.
