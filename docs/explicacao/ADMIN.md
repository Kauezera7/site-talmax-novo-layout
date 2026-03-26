# Admin

## Funcao

O painel administrativo gerencia:

- produtos
- categorias e subcategorias
- banners
- selecoes especiais de paginas como Upcera, Scanners e Impressoras 3D

## Rotas Do Painel

- `/admin`
  Redireciona para o login
- `/admin/login`
  Tela de autenticacao
- `/admin/painel`
  Area protegida do painel

## Entrada Principal

O arquivo principal do painel e:

```txt
frontend/src/pages/Admin/AdminDashboard.jsx
```

O formulario de login fica em:

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
  Hooks de leitura e mutacao.
- `frontend/src/services/adminAuth.js`
  Login, sessao e logout.
- `frontend/src/services/adminRequest.js`
  Requisicoes autenticadas.

## Modulos Internos

- `AdminProducts/`
  Cadastro e listagem de produtos
- `AdminCategories/`
  Categorias e subcategorias
- `AdminBanners/`
  Banners do site
- `AdminUpcera/`
  Gestao da pagina Upcera
- `AdminScanners/`
  Gestao da pagina de scanners
- `AdminPrinters/`
  Gestao da pagina de impressoras 3D

## Observacoes Importantes

- A rota protegida real do painel e `/admin/painel`, nao `/admin`.
- O `AdminDashboard` abre modulos internos por estado local, sem rotas separadas para cada aba.
- A autenticacao depende de sessao HTTP validada em `/api/admin/session`.
