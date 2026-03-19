# Documentacao Do Painel Admin

Este arquivo explica como o painel administrativo esta organizado, quais arquivos fazem o que e por onde comecar quando voce precisar mexer em alguma parte.

## 1. O Que E Este Admin

O painel admin e a area interna usada para gerenciar:

- produtos
- categorias e subcategorias
- banners
- selecoes especiais como Upcera, Scanners e Impressoras 3D

A entrada principal do painel e:

- [AdminDashboard.jsx](/c:/Users/ti6/Desktop/Desvolvimento/site-talmax/frontend/src/pages/Admin/AdminDashboard.jsx)

A rota publica que abre o painel e:

- `/admin`

## 2. Estrutura Do Admin

```txt
frontend/src/pages/Admin/
├── AdminDashboard.jsx
├── AdminBase.css
├── README.md
├── AdminProducts/
│   ├── AdminProducts.jsx
│   ├── AdminProducts.css
│   ├── ProductForm.jsx
│   └── ProductTable.jsx
├── AdminCategories/
│   ├── AdminCategories.jsx
│   ├── AdminCategories.css
│   ├── CategoryForm.jsx
│   └── CategoryTable.jsx
├── AdminBanners/
│   ├── AdminBanners.jsx
│   ├── AdminBanners.css
│   ├── BannerForm.jsx
│   └── BannerTable.jsx
├── AdminUpcera/
│   ├── AdminUpcera.jsx
│   ├── SpecialSectionManager.jsx
│   └── SpecialSectionManager.css
├── AdminScanners/
│   ├── AdminScanners.jsx
│   └── AdminScanners.css
└── AdminPrinters/
    ├── AdminPrinters.jsx
    └── AdminPrinters.css
```

## 3. Papel De Cada Arquivo Principal

### [AdminDashboard.jsx](/c:/Users/ti6/Desktop/Desvolvimento/site-talmax/frontend/src/pages/Admin/AdminDashboard.jsx)

Arquivo principal do painel.

Responsavel por:

- montar o layout do admin
- controlar a sidebar
- trocar a secao ativa
- renderizar cada area interna
- usar o `AdminProvider`

Pense nele como o "container do admin".

### [AdminBase.css](/c:/Users/ti6/Desktop/Desvolvimento/site-talmax/frontend/src/pages/Admin/AdminBase.css)

CSS base compartilhado do painel.

Aqui ficam estilos globais do admin, como:

- layout principal
- sidebar
- cards base
- botoes base
- tabelas base
- modal base
- toast

Regra pratica:

- se o estilo e usado por varias telas do admin, ele fica aqui
- se o estilo e so de uma feature, ele deve ficar na pasta da feature

## 4. Como O Admin Funciona Por Dentro

O fluxo geral do painel e este:

```txt
AdminDashboard
-> AdminContext
-> hooks
-> services
-> backend API
-> banco de dados
```

Ou seja:

1. a tela do admin renderiza um componente
2. esse componente usa `useAdmin()`
3. o `AdminContext` entrega dados e funcoes
4. os hooks chamam os services
5. os services chamam a API do backend

## 5. Estado Compartilhado Do Admin

O estado compartilhado do painel fica em:

- [AdminContext.jsx](/c:/Users/ti6/Desktop/Desvolvimento/site-talmax/frontend/src/context/AdminContext.jsx)

Ele junta:

- produtos
- categorias
- subcategorias
- banners
- loading
- erro
- `refreshAll`
- toasts

Ele usa os hooks:

- [useProducts.js](/c:/Users/ti6/Desktop/Desenvolvimento/site-talmax/frontend/src/hooks/useProducts.js)
- [useCategories.js](/c:/Users/ti6/Desktop/Desenvolvimento/site-talmax/frontend/src/hooks/useCategories.js)
- [useBanners.js](/c:/Users/ti6/Desktop/Desenvolvimento/site-talmax/frontend/src/hooks/useBanners.js)

## 6. Services Que O Admin Usa

As chamadas HTTP ficam em:

- [productService.js](/c:/Users/ti6/Desktop/Desenvolvimento/site-talmax/frontend/src/services/productService.js)
- [categoryService.js](/c:/Users/ti6/Desktop/Desenvolvimento/site-talmax/frontend/src/services/categoryService.js)
- [bannerService.js](/c:/Users/ti6/Desktop/Desenvolvimento/site-talmax/frontend/src/services/bannerService.js)
- [api.js](/c:/Users/ti6/Desktop/Desenvolvimento/site-talmax/frontend/src/services/api.js)

Esses arquivos sao a ponte entre frontend e backend.

## 7. Area De Produtos

Arquivos:

- [AdminProducts.jsx](/c:/Users/ti6/Desktop/Desenvolvimento/site-talmax/frontend/src/pages/Admin/AdminProducts/AdminProducts.jsx)
- [AdminProducts.css](/c:/Users/ti6/Desktop/Desenvolvimento/site-talmax/frontend/src/pages/Admin/AdminProducts/AdminProducts.css)
- [ProductForm.jsx](/c:/Users/ti6/Desktop/Desenvolvimento/site-talmax/frontend/src/pages/Admin/AdminProducts/ProductForm.jsx)
- [ProductTable.jsx](/c:/Users/ti6/Desktop/Desenvolvimento/site-talmax/frontend/src/pages/Admin/AdminProducts/ProductTable.jsx)

Funcao de cada um:

- `AdminProducts.jsx`
  tela principal da area de produtos
- `ProductForm.jsx`
  formulario de criacao e edicao
- `ProductTable.jsx`
  listagem de produtos
- `AdminProducts.css`
  estilos especificos desta area

Quando mexer aqui:

- se quiser alterar cadastro de produto
- se quiser alterar tabela de produtos
- se quiser alterar campos do formulario

## 8. Area De Categorias

Arquivos:

- [AdminCategories.jsx](/c:/Users/ti6/Desktop/Desenvolvimento/site-talmax/frontend/src/pages/Admin/AdminCategories/AdminCategories.jsx)
- [AdminCategories.css](/c:/Users/ti6/Desktop/Desenvolvimento/site-talmax/frontend/src/pages/Admin/AdminCategories/AdminCategories.css)
- [CategoryForm.jsx](/c:/Users/ti6/Desktop/Desenvolvimento/site-talmax/frontend/src/pages/Admin/AdminCategories/CategoryForm.jsx)
- [CategoryTable.jsx](/c:/Users/ti6/Desktop/Desenvolvimento/site-talmax/frontend/src/pages/Admin/AdminCategories/CategoryTable.jsx)

Funcao de cada um:

- `AdminCategories.jsx`
  tela principal da area de categorias
- `CategoryForm.jsx`
  formulario de categoria e subcategoria
- `CategoryTable.jsx`
  tabela de categorias
- `AdminCategories.css`
  estilos especificos da feature

Quando mexer aqui:

- se quiser alterar categorias principais
- se quiser alterar subcategorias
- se quiser alterar icones e visibilidade

## 9. Area De Banners

Arquivos:

- [AdminBanners.jsx](/c:/Users/ti6/Desktop/Desenvolvimento/site-talmax/frontend/src/pages/Admin/AdminBanners/AdminBanners.jsx)
- [AdminBanners.css](/c:/Users/ti6/Desktop/Desenvolvimento/site-talmax/frontend/src/pages/Admin/AdminBanners/AdminBanners.css)
- [BannerForm.jsx](/c:/Users/ti6/Desktop/Desenvolvimento/site-talmax/frontend/src/pages/Admin/AdminBanners/BannerForm.jsx)
- [BannerTable.jsx](/c:/Users/ti6/Desktop/Desenvolvimento/site-talmax/frontend/src/pages/Admin/AdminBanners/BannerTable.jsx)

Funcao de cada um:

- `AdminBanners.jsx`
  tela principal de banners
- `BannerForm.jsx`
  formulario de cadastro e edicao
- `BannerTable.jsx`
  tabela/listagem de banners
- `AdminBanners.css`
  estilo visual dessa area

Quando mexer aqui:

- se quiser alterar campos do banner
- se quiser alterar ativacao/desativacao
- se quiser mudar a tabela de banners

## 10. Secoes Especiais

### Upcera

Arquivos:

- [AdminUpcera.jsx](/c:/Users/ti6/Desktop/Desenvolvimento/site-talmax/frontend/src/pages/Admin/AdminUpcera/AdminUpcera.jsx)
- [SpecialSectionManager.jsx](/c:/Users/ti6/Desktop/Desenvolvimento/site-talmax/frontend/src/pages/Admin/AdminUpcera/SpecialSectionManager.jsx)
- [SpecialSectionManager.css](/c:/Users/ti6/Desktop/Desenvolvimento/site-talmax/frontend/src/pages/Admin/AdminUpcera/SpecialSectionManager.css)

### Scanners

Arquivos:

- [AdminScanners.jsx](/c:/Users/ti6/Desktop/Desenvolvimento/site-talmax/frontend/src/pages/Admin/AdminScanners/AdminScanners.jsx)
- [AdminScanners.css](/c:/Users/ti6/Desktop/Desenvolvimento/site-talmax/frontend/src/pages/Admin/AdminScanners/AdminScanners.css)

### Impressoras

Arquivos:

- [AdminPrinters.jsx](/c:/Users/ti6/Desktop/Desenvolvimento/site-talmax/frontend/src/pages/Admin/AdminPrinters/AdminPrinters.jsx)
- [AdminPrinters.css](/c:/Users/ti6/Desktop/Desenvolvimento/site-talmax/frontend/src/pages/Admin/AdminPrinters/AdminPrinters.css)

Como funciona:

- `AdminUpcera`, `AdminScanners` e `AdminPrinters` sao telas de configuracao
- o componente compartilhado que faz a maior parte da logica fica em `SpecialSectionManager.jsx`
- ele controla selecao de produtos e ordem de exibicao

## 11. Onde Mexer Dependendo Do Que Voce Quer Alterar

Se quiser alterar:

- layout geral do admin:
  [AdminDashboard.jsx](/c:/Users/ti6/Desktop/Desenvolvimento/site-talmax/frontend/src/pages/Admin/AdminDashboard.jsx)
  e
  [AdminBase.css](/c:/Users/ti6/Desktop/Desenvolvimento/site-talmax/frontend/src/pages/Admin/AdminBase.css)

- logica compartilhada do admin:
  [AdminContext.jsx](/c:/Users/ti6/Desktop/Desenvolvimento/site-talmax/frontend/src/context/AdminContext.jsx)

- produtos:
  [AdminProducts](/c:/Users/ti6/Desktop/Desenvolvimento/site-talmax/frontend/src/pages/Admin/AdminProducts)

- categorias:
  [AdminCategories](/c:/Users/ti6/Desktop/Desenvolvimento/site-talmax/frontend/src/pages/Admin/AdminCategories)

- banners:
  [AdminBanners](/c:/Users/ti6/Desktop/Desenvolvimento/site-talmax/frontend/src/pages/Admin/AdminBanners)

- secoes especiais:
  [AdminUpcera](/c:/Users/ti6/Desktop/Desenvolvimento/site-talmax/frontend/src/pages/Admin/AdminUpcera)
  [AdminScanners](/c:/Users/ti6/Desktop/Desenvolvimento/site-talmax/frontend/src/pages/Admin/AdminScanners)
  [AdminPrinters](/c:/Users/ti6/Desktop/Desenvolvimento/site-talmax/frontend/src/pages/Admin/AdminPrinters)

- chamadas de API:
  [services](/c:/Users/ti6/Desktop/Desenvolvimento/site-talmax/frontend/src/services)

## 12. Boas Praticas Deste Projeto

A organizacao atual segue esta regra:

- componente importante fica na propria pasta
- CSS especifico fica junto da feature
- CSS global do admin fica em `AdminBase.css`
- estado compartilhado fica no contexto
- regras de chamada HTTP ficam em `services`

Quando criar algo novo no admin, tente seguir:

```txt
NovaArea/
├── NovaArea.jsx
├── NovaArea.css
├── ItemForm.jsx
└── ItemTable.jsx
```

## 13. Fluxo De Exemplo

Exemplo com banners:

```txt
AdminBanners.jsx
-> useAdmin()
-> bannersHook
-> useBanners.js
-> bannerService.js
-> /api/banners
-> backend/server.js
```

Exemplo com produtos:

```txt
AdminProducts.jsx
-> useAdmin()
-> productsHook
-> useProducts.js
-> productService.js
-> /api/products
-> backend/server.js
```

## 14. Resumo Rapido

Se voce abrir o admin pela primeira vez, pense assim:

- `AdminDashboard.jsx`
  controla o painel
- `AdminContext.jsx`
  centraliza os dados
- `hooks/`
  carregam e atualizam os dados
- `services/`
  falam com a API
- cada pasta `Admin...`
  representa uma area funcional do painel

## 15. Proximo Nivel De Organizacao

Se no futuro o painel crescer mais, um bom proximo passo seria:

- separar melhor componentes compartilhados do admin
- criar mais documentacao por area
- dividir backend em `routes`, `controllers` e `services`

Mas no estado atual, a estrutura ja esta boa para manutencao se voce continuar seguindo o padrao por feature.

