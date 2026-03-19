# Admin

## Funcao

O admin é o painel usado para gerenciar:

- produtos
- categorias
- banners
- seções especiais

## Entrada Principal

- Rota: `/admin`
- Arquivo principal: `frontend/src/pages/Admin/AdminDashboard.jsx`

## Estrutura Atual

```txt
frontend/src/pages/Admin/
├── AdminBase.css
├── AdminDashboard.jsx
├── README.md
├── AdminBanners/
├── AdminCategories/
├── AdminPrinters/
├── AdminProducts/
├── AdminScanners/
└── AdminUpcera/
```

## Como Funciona

```txt
AdminDashboard
-> AdminContext
-> hooks
-> services
-> backend
```

## Arquivos Mais Importantes

- `AdminDashboard.jsx`
  Estrutura principal do painel.
- `AdminBase.css`
  Estilo base do admin.
- `frontend/src/context/AdminContext.jsx`
  Estado compartilhado do admin.
- `frontend/src/hooks/`
  Regras de carregamento e atualização.
- `frontend/src/services/`
  Comunicação com a API.

## Modulos

- `AdminProducts/`
  Cadastro e listagem de produtos
- `AdminCategories/`
  Categorias e subcategorias
- `AdminBanners/`
  Banners do site
- `AdminUpcera/`
  Gestão da seção Upcera
- `AdminScanners/`
  Gestão da seção de scanners
- `AdminPrinters/`
  Gestão da seção de impressoras
