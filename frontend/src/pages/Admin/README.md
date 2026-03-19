# Mapa Da Estrutura Do Projeto

Este arquivo e um mapa rapido do projeto inteiro para voce se localizar melhor.

## Visao Geral

```text
site-talmax/
├── backend/
├── frontend/
├── docs/
├── .vite/
├── README.md
├── GEMINI.md
└── package-lock.json
```

## O Que Cada Pasta Principal Faz

- `backend/`
  Backend em Node.js + Express + MySQL.
- `frontend/`
  Frontend em React.
- `docs/`
  Espaco para documentacoes extras do projeto.
- `.vite/`
  Arquivos gerados pelo ambiente do Vite.

---

## Backend

### Estrutura Atual

```text
backend/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   │   ├── migrations/
│   │   │   ├── add_3d_printer_column.js
│   │   │   ├── add_special_orders.js
│   │   │   ├── add_upcera_column.js
│   │   │   ├── capitalize_segments.js
│   │   │   └── update_segments.js
│   │   └── seeds/
│   ├── services/
│   └── utils/
│       ├── helpers.js
│       └── queries.js
├── .env
├── database_schema.sql
├── list_categories.js
├── package.json
├── package-lock.json
└── server.js
```

### Explicando O Backend

- `backend/server.js`
  Arquivo principal do backend.
  Hoje ele concentra:
  - configuracao do Express
  - configuracao do CORS
  - configuracao do Multer
  - servico de arquivos estaticos
  - rotas de categorias
  - rotas de banners
  - rotas de produtos
  - rotas das secoes especiais como Upcera, Scanners e Impressoras 3D

- `backend/src/config/database.js`
  Conexao com MySQL usando `mysql2`.
  Esse arquivo exporta o pool de conexao prometificado para usar com `async/await`.

- `backend/src/controllers/`
  Pasta preparada para separar a logica das rotas.
  No estado atual ela existe, mas ainda nao esta sendo usada.

- `backend/src/routes/`
  Pasta preparada para separar as rotas em arquivos diferentes.
  No estado atual ela existe, mas hoje as rotas ainda estao centralizadas em `server.js`.

- `backend/src/models/`
  Pasta preparada para modelos ou camada de acesso a dados.
  Hoje ainda nao esta sendo usada.

- `backend/src/middleware/`
  Pasta preparada para middlewares personalizados.
  Hoje ainda nao esta sendo usada.

- `backend/src/services/`
  Pasta preparada para regras de negocio ou servicos auxiliares.
  Hoje ainda nao esta sendo usada.

- `backend/src/utils/helpers.js`
  Arquivo utilitario para funcoes auxiliares.

- `backend/src/utils/queries.js`
  Arquivo utilitario para consultas ou trechos reutilizaveis de SQL.

- `backend/src/scripts/migrations/`
  Scripts de ajuste de banco.
  Servem para evoluir a estrutura do banco sem alterar tudo manualmente.

- `backend/src/scripts/seeds/`
  Pasta reservada para popular dados iniciais.
  Hoje parece vazia.

- `backend/.env`
  Variaveis de ambiente do backend.
  Exemplo:
  - host do banco
  - usuario
  - senha
  - nome do banco
  - porta do servidor

- `backend/database_schema.sql`
  Script base de estrutura do banco de dados.

- `backend/list_categories.js`
  Script auxiliar solto na raiz do backend.
  Provavelmente usado para inspecao ou manutencao.

- `backend/package.json`
  Dependencias do backend.
  Hoje usa principalmente:
  - `express`
  - `cors`
  - `dotenv`
  - `multer`
  - `mysql2`

### Observacao Importante Sobre O Backend

O backend ja tem estrutura de projeto maior, mas a implementacao atual ainda esta bem concentrada em `server.js`.

Ou seja:

- a arquitetura preparada existe
- mas a logica principal ainda nao foi distribuida em `routes/`, `controllers/`, `services/` e `middleware/`

Isso significa que no futuro voce pode refatorar assim:

```text
server.js -> routes -> controllers -> services -> database
```

Hoje o fluxo real esta mais perto disso:

```text
server.js -> database.js -> MySQL
```

---

## Frontend

### Estrutura Atual

```text
frontend/
├── src/
│   ├── assets/
│   │   └── react.svg
│   ├── components/
│   │   ├── CookieBanner.jsx
│   │   ├── HeroSlider.jsx
│   │   ├── Home.jsx
│   │   ├── Impressoras3D.jsx
│   │   ├── PagePlaceholder.jsx
│   │   ├── PrivacyPolicy.jsx
│   │   ├── ProductCard.jsx
│   │   ├── ProductCatalog.jsx
│   │   ├── ProductCatalog.css
│   │   ├── ProductDetail.jsx
│   │   ├── ProductDetail.css
│   │   ├── Scanners.jsx
│   │   ├── SpecialPages.css
│   │   ├── TalmaxDigital.jsx
│   │   ├── TalmaxDigital.css
│   │   └── Upcera.jsx
│   ├── context/
│   │   └── AdminContext.jsx
│   ├── hooks/
│   │   ├── useBanners.js
│   │   ├── useCategories.js
│   │   └── useProducts.js
│   ├── pages/
│   │   └── Admin/
│   ├── services/
│   │   ├── api.js
│   │   ├── bannerService.js
│   │   ├── categoryService.js
│   │   └── productService.js
│   ├── App.css
│   ├── App.jsx
│   ├── data.js
│   ├── index.css
│   └── main.jsx
```

### Explicando O Frontend

- `frontend/src/main.jsx`
  Ponto de entrada do React.

- `frontend/src/App.jsx`
  Componente principal da aplicacao.

- `frontend/src/App.css`
  Estilo global do app principal.

- `frontend/src/index.css`
  Estilo base global carregado no inicio.

- `frontend/src/data.js`
  Dados auxiliares ou mock local usados pelo frontend.

### Components

- `frontend/src/components/`
  Componentes da parte publica do site.

Exemplos:

- `Home.jsx`
  Pagina inicial.
- `HeroSlider.jsx`
  Slider principal.
- `ProductCatalog.jsx`
  Catalogo/lista de produtos.
- `ProductDetail.jsx`
  Detalhe do produto.
- `Upcera.jsx`, `Scanners.jsx`, `Impressoras3D.jsx`
  Paginas especiais de segmentos.
- `PrivacyPolicy.jsx`
  Politica de privacidade.
- `CookieBanner.jsx`
  Banner de cookies.

### Services

- `frontend/src/services/api.js`
  Configuracao da URL base da API.

- `frontend/src/services/productService.js`
  Chamadas HTTP relacionadas a produtos.

- `frontend/src/services/categoryService.js`
  Chamadas HTTP relacionadas a categorias.

- `frontend/src/services/bannerService.js`
  Chamadas HTTP relacionadas a banners.

### Hooks

- `frontend/src/hooks/useProducts.js`
  Hook para buscar, criar, editar, excluir e atualizar secoes especiais de produtos.

- `frontend/src/hooks/useCategories.js`
  Hook para gerenciar categorias e subcategorias.

- `frontend/src/hooks/useBanners.js`
  Hook para gerenciar banners.

### Context

- `frontend/src/context/AdminContext.jsx`
  Contexto do painel administrativo.
  Ele junta os hooks do admin e entrega:
  - produtos
  - categorias
  - banners
  - loading
  - error
  - refresh geral
  - sistema de toast

---

## Frontend Admin

### Estrutura Atual

```text
frontend/src/pages/Admin/
├── AdminBase.css
├── AdminDashboard.jsx
├── README.md
├── AdminBanners/
│   ├── AdminBanners.css
│   ├── AdminBanners.jsx
│   ├── BannerForm.jsx
│   └── BannerTable.jsx
├── AdminCategories/
│   ├── AdminCategories.css
│   ├── AdminCategories.jsx
│   ├── CategoryForm.jsx
│   └── CategoryTable.jsx
├── AdminProducts/
│   ├── AdminProducts.css
│   ├── AdminProducts.jsx
│   ├── ProductForm.jsx
│   └── ProductTable.jsx
├── AdminUpcera/
│   ├── AdminUpcera.jsx
│   ├── SpecialSectionManager.css
│   └── SpecialSectionManager.jsx
├── AdminScanners/
│   └── AdminScanners.jsx
└── AdminPrinters/
    └── AdminPrinters.jsx
```

### Explicando O Admin

- `AdminDashboard.jsx`
  Entrada do painel.
  Controla:
  - sidebar
  - navegacao por abas
  - layout principal
  - toasts
  - renderizacao de cada area

- `AdminBase.css`
  CSS base compartilhado do painel administrativo.
  Aqui ficam:
  - layout do admin
  - sidebar
  - cards base
  - modal base
  - tabela base
  - toast
  - estilos compartilhados

### Banners

- `AdminBanners/AdminBanners.jsx`
  Tela principal de banners.
- `AdminBanners/BannerForm.jsx`
  Formulario de banner.
- `AdminBanners/BannerTable.jsx`
  Tabela de banners.
- `AdminBanners/AdminBanners.css`
  Estilos especificos de banners.

### Categorias

- `AdminCategories/AdminCategories.jsx`
  Tela principal de categorias.
- `AdminCategories/CategoryForm.jsx`
  Formulario de categoria e subcategoria.
- `AdminCategories/CategoryTable.jsx`
  Tabela de categorias.
- `AdminCategories/AdminCategories.css`
  Estilos especificos de categorias.

### Produtos

- `AdminProducts/AdminProducts.jsx`
  Tela principal de produtos.
- `AdminProducts/ProductForm.jsx`
  Formulario de produto.
- `AdminProducts/ProductTable.jsx`
  Tabela/lista de produtos.
- `AdminProducts/AdminProducts.css`
  Estilos especificos de produtos.

### Secoes Especiais

- `AdminUpcera/AdminUpcera.jsx`
  Tela da secao Upcera.
- `AdminScanners/AdminScanners.jsx`
  Tela da secao Scanners.
- `AdminPrinters/AdminPrinters.jsx`
  Tela da secao Impressoras 3D.
- `AdminUpcera/SpecialSectionManager.jsx`
  Componente compartilhado que gerencia selecao de produtos dessas secoes.
- `AdminUpcera/SpecialSectionManager.css`
  Estilo especifico desse gerenciador.

---

## Fluxo Geral Do Projeto

### Backend

```text
Frontend -> services -> API -> backend/server.js -> database.js -> MySQL
```

### Frontend Admin

```text
AdminDashboard
-> AdminContext
-> hooks
-> services
-> backend API
```

### Fluxo De Uma Area Do Admin

Exemplo com banners:

```text
AdminBanners.jsx
-> useAdmin()
-> bannersHook
-> useBanners.js
-> bannerService.js
-> /api/banners
-> backend/server.js
```

---

## Como Pensar A Organizacao

### No Backend

Hoje:

- backend funcional
- rotas centralizadas em `server.js`
- estrutura preparada para crescer

Se quiser evoluir depois:

- mover rotas para `src/routes`
- mover logica para `src/controllers`
- mover regras para `src/services`
- mover validacoes e tratamento para `src/middleware`

### No Frontend

Regra usada hoje:

- se o estilo e compartilhado no admin:
  fica em `AdminBase.css`
- se o estilo e especifico de uma tela:
  fica na pasta da feature

Exemplo:

- `AdminBase.css`:
  layout, sidebar, modal, tabela base
- `AdminBanners.css`:
  visual de banners
- `AdminProducts.css`:
  visual de produtos
- `AdminCategories.css`:
  visual de categorias

---

## Onde Mexer Dependendo Do Que Voce Quer Alterar

Se quiser alterar:

- layout do admin:
  `frontend/src/pages/Admin/AdminDashboard.jsx`
  e
  `frontend/src/pages/Admin/AdminBase.css`

- logica compartilhada do admin:
  `frontend/src/context/AdminContext.jsx`

- banners:
  `frontend/src/pages/Admin/AdminBanners`

- categorias:
  `frontend/src/pages/Admin/AdminCategories`

- produtos:
  `frontend/src/pages/Admin/AdminProducts`

- secoes especiais:
  `frontend/src/pages/Admin/AdminUpcera`
  `frontend/src/pages/Admin/AdminScanners`
  `frontend/src/pages/Admin/AdminPrinters`

- chamadas de API no frontend:
  `frontend/src/services`

- conexao com banco:
  `backend/src/config/database.js`

- rotas da API hoje:
  `backend/server.js`

---

## Resumo Rapido

Se voce quiser se achar rapido, pensa assim:

```text
backend/
-> API + banco

frontend/src/components/
-> site publico

frontend/src/pages/Admin/
-> painel administrativo

frontend/src/services/
-> chamadas HTTP

frontend/src/context/
-> estado compartilhado do admin

frontend/src/hooks/
-> logica de dados do admin
```

---

## Observacao Final

O projeto esta num meio termo bom:

- o frontend admin ja esta mais organizado por feature
- o backend ainda esta funcional, mas mais centralizado

Ou seja:

- o frontend esta mais modular
- o backend ainda pode ser modularizado mais para frente

Se quiser, o proximo passo que eu posso fazer e gerar um segundo documento:

- `MAPA-BACKEND.md`
- `MAPA-FRONTEND.md`

separando tudo ainda mais para ficar mais facil de consultar.
