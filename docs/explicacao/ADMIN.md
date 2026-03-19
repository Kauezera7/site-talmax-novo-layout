# Admin

## Funcao

O admin e o painel usado para gerenciar:

- produtos
- categorias
- banners
- secoes especiais

## Entrada Principal

- Rota: `/admin`
- Arquivo principal:

```txt
frontend/src/pages/Admin/AdminDashboard.jsx
```

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
- ```txt
  frontend/src/context/AdminContext.jsx
  ```
  Estado compartilhado do admin.
- ```txt
  frontend/src/hooks/
  ```
  Regras de carregamento e atualizacao.
- ```txt
  frontend/src/services/
  ```
  Comunicacao com a API.

## Modulos

- `AdminProducts/`
  Cadastro e listagem de produtos
- `AdminCategories/`
  Categorias e subcategorias
- `AdminBanners/`
  Banners do site
- `AdminUpcera/`
  Gestao da secao Upcera
- `AdminScanners/`
  Gestao da secao de scanners
- `AdminPrinters/`
  Gestao da secao de impressoras
