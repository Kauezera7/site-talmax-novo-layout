# Documentação do Painel Admin

Este arquivo resume a organização do painel administrativo do projeto.

## Entrada e Rotas

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

## Como o Painel Funciona

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
  Login, validação de sessão e logout.

## Módulos

- [AdminProducts](/c:/Users/ti6/Desktop/Desvolvimento/site-talmax/frontend/src/pages/Admin/AdminProducts)
  CRUD de produtos.
- [AdminCategories](/c:/Users/ti6/Desktop/Desenvolvimento/site-talmax/frontend/src/pages/Admin/AdminCategories)
  CRUD de categorias e subcategorias.
- [AdminBanners](/c:/Users/ti6/Desktop/Desenvolvimento/site-talmax/frontend/src/pages/Admin/AdminBanners)
  CRUD de banners.
- [AdminUpcera](/c:/Users/ti6/Desktop/Desenvolvimento/site-talmax/frontend/src/pages/Admin/AdminUpcera)
  Seleção de produtos da página Upcera.
- [AdminScanners](/c:/Users/ti6/Desktop/Desenvolvimento/site-talmax/frontend/src/pages/Admin/AdminScanners)
  Seleção de produtos da página Scanners.
- [AdminPrinters](/c:/Users/ti6/Desktop/Desenvolvimento/site-talmax/frontend/src/pages/Admin/AdminPrinters)
  Seleção de produtos da página Impressoras 3D.

## Observações

- O painel não usa sub-rotas internas por módulo; a troca entre áreas acontece por estado em `AdminDashboard.jsx`.
- O acesso depende de sessão válida retornada por `/api/admin/session`.
