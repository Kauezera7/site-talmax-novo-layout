# Admin

## Função

O painel administrativo gerencia:

- produtos
- categorias e subcategorias
- banners
- seleções especiais de páginas como Upcera, Scanners e Impressoras 3D

## Rotas do Painel

- `/admin`
  Redireciona para o login
- `/admin/login`
  Tela de autenticação
- `/admin/painel`
  Área protegida do painel

## Entrada Principal

O arquivo principal do painel é:

```txt
frontend/src/pages/Admin/AdminDashboard.jsx
```

O formulário de login fica em:

```txt
frontend/src/components/AdminLogin/AdminLogin.jsx
```

## Estrutura Atual

```txt
frontend/src/pages/Admin/
|-- AdminBase.css
|-- AdminDashboard.jsx
|-- README.md
|-- AdminBanners/
|-- AdminCategories/
|-- AdminPrinters/
|-- AdminProducts/
|-- AdminScanners/
`-- AdminUpcera/
```

## Como Funciona

```txt
AdminLogin
-> adminAuth.js
-> /api/admin/login

AdminDashboard
-> AdminProvider
-> AdminContext
-> hooks
-> services
-> backend
```

## Arquivos Mais Importantes

- `frontend/src/pages/Admin/AdminDashboard.jsx`
  Estrutura principal do painel, menu lateral, abas e logout.
- `frontend/src/pages/Admin/AdminBase.css`
  Base visual compartilhada do painel.
- `frontend/src/context/AdminContext.jsx`
  Estado compartilhado e acesso consolidado a produtos, categorias, banners e toasts.
- `frontend/src/hooks/`
  Hooks de leitura e mutação.
- `frontend/src/services/adminAuth.js`
  Login, sessão e logout.
- `frontend/src/services/adminRequest.js`
  Requisições autenticadas.

## Módulos Internos

- `AdminProducts/`
  Cadastro e listagem de produtos
- `AdminCategories/`
  Categorias e subcategorias
- `AdminBanners/`
  Banners do site
- `AdminUpcera/`
  Gestão da página Upcera
- `AdminScanners/`
  Gestão da página de scanners
- `AdminPrinters/`
  Gestão da página de impressoras 3D

## Observações Importantes

- A rota protegida real do painel é `/admin/painel`, não `/admin`.
- O `AdminDashboard` abre módulos internos por estado local, sem rotas separadas para cada aba.
- A autenticação depende de sessão HTTP validada em `/api/admin/session`.
