# Mapa Da Estrutura Do Projeto

Este documento mostra a estrutura principal do projeto `site-talmax` e a funcao de cada parte.

## Estrutura Completa De Arquivos

```txt
site-talmax/
├── .vite/                              # Cache/local do Vite
├── backend/
│   ├── .env                            # Configuracoes sensiveis do backend
│   ├── database_schema.sql             # Script principal de estrutura do banco
│   ├── list_categories.js              # Script utilitario para listar categorias
│   ├── package.json                    # Dependencias do backend
│   ├── package-lock.json               # Lock de dependencias do backend
│   ├── server.js                       # Arquivo principal da API hoje
│   ├── node_modules/                   # Dependencias instaladas do backend
│   └── src/
│       ├── config/
│       │   └── database.js             # Conexao com MySQL
│       ├── controllers/                # Pasta preparada para separar regras por modulo
│       ├── middleware/                 # Pasta preparada para middlewares
│       ├── models/                     # Pasta preparada para models
│       ├── routes/                     # Pasta preparada para rotas
│       ├── services/                   # Pasta preparada para services
│       ├── scripts/
│       │   ├── migrations/
│       │   │   ├── add_3d_printer_column.js
│       │   │   ├── add_special_orders.js
│       │   │   ├── add_upcera_column.js
│       │   │   ├── capitalize_segments.js
│       │   │   └── update_segments.js
│       │   └── seeds/                  # Pasta reservada para seeds
│       └── utils/
│           ├── helpers.js              # Funcoes auxiliares
│           └── queries.js              # Queries SQL reutilizaveis
├── docs/
│   └── MAPA_ESTRUTURA_PROJETO.md       # Este guia
├── frontend/
│   ├── .gitignore
│   ├── eslint.config.js                # Configuracao do ESLint
│   ├── index.html                      # HTML base do frontend
│   ├── package.json                    # Dependencias do frontend
│   ├── package-lock.json               # Lock de dependencias do frontend
│   ├── vite.config.js                  # Configuracao do Vite
│   ├── dist/                           # Build gerada para producao
│   ├── public/
│   │   ├── vite.svg
│   │   └── img/                        # Imagens publicas do site e uploads
│   └── src/
│       ├── App.css                     # Estilos globais da aplicacao
│       ├── App.jsx                     # Rotas e layout principal
│       ├── data.js                     # Dados estaticos/fallback
│       ├── index.css                   # Estilos base
│       ├── main.jsx                    # Entrada do React
│       ├── assets/                     # Arquivos estaticos importados no codigo
│       ├── components/                 # Paginas e componentes publicos
│       │   ├── CookieBanner/
│       │   │   ├── CookieBanner.css
│       │   │   └── CookieBanner.jsx
│       │   ├── HeroSlider/
│       │   │   ├── HeroSlider.css
│       │   │   └── HeroSlider.jsx
│       │   ├── Home/
│       │   │   ├── Home.css
│       │   │   └── Home.jsx
│       │   ├── Impressoras3D/
│       │   │   ├── Impressoras3D.css
│       │   │   └── Impressoras3D.jsx
│       │   ├── PagePlaceholder/
│       │   │   ├── PagePlaceholder.css
│       │   │   └── PagePlaceholder.jsx
│       │   ├── PrivacyPolicy/
│       │   │   ├── PrivacyPolicy.css
│       │   │   └── PrivacyPolicy.jsx
│       │   ├── ProductCard/
│       │   │   ├── ProductCard.css
│       │   │   └── ProductCard.jsx
│       │   ├── ProductCatalog/
│       │   │   ├── ProductCatalog.css
│       │   │   └── ProductCatalog.jsx
│       │   ├── ProductDetail/
│       │   │   ├── ProductDetail.css
│       │   │   └── ProductDetail.jsx
│       │   ├── Scanners/
│       │   │   ├── Scanners.css
│       │   │   └── Scanners.jsx
│       │   ├── TalmaxDigital/
│       │   │   ├── TalmaxDigital.css
│       │   │   └── TalmaxDigital.jsx
│       │   └── Upcera/
│       │       ├── Upcera.css
│       │       └── Upcera.jsx
│       ├── context/
│       │   └── AdminContext.jsx        # Estado compartilhado do admin
│       ├── hooks/
│       │   ├── useBanners.js
│       │   ├── useCategories.js
│       │   └── useProducts.js
│       ├── pages/
│       │   └── Admin/
│       │       ├── AdminBase.css
│       │       ├── AdminDashboard.jsx
│       │       ├── README.md
│       │       ├── AdminBanners/
│       │       │   ├── AdminBanners.css
│       │       │   ├── AdminBanners.jsx
│       │       │   ├── BannerForm.jsx
│       │       │   └── BannerTable.jsx
│       │       ├── AdminCategories/
│       │       │   ├── AdminCategories.css
│       │       │   ├── AdminCategories.jsx
│       │       │   ├── CategoryForm.jsx
│       │       │   └── CategoryTable.jsx
│       │       ├── AdminPrinters/
│       │       │   ├── AdminPrinters.css
│       │       │   └── AdminPrinters.jsx
│       │       ├── AdminProducts/
│       │       │   ├── AdminProducts.css
│       │       │   ├── AdminProducts.jsx
│       │       │   ├── ProductForm.jsx
│       │       │   └── ProductTable.jsx
│       │       ├── AdminScanners/
│       │       │   ├── AdminScanners.css
│       │       │   └── AdminScanners.jsx
│       │       └── AdminUpcera/
│       │           ├── AdminUpcera.jsx
│       │           ├── SpecialSectionManager.css
│       │           └── SpecialSectionManager.jsx
│       └── services/
│           ├── api.js
│           ├── bannerService.js
│           ├── categoryService.js
│           └── productService.js
├── .gitignore
├── GEMINI.md
└── package-lock.json
```

## O Que Foi Corrigido Em Relacao Ao Exemplo

- Em `docs/`, hoje existe `MAPA_ESTRUTURA_PROJETO.md`. O `.txt` nao esta nessa pasta.
- O `backend/src/` tem mais pastas do que no exemplo: `controllers`, `middleware`, `models`, `routes`, `services` e `scripts/seeds`.
- O `frontend/src/components/` esta organizado por pastas, com `jsx + css` juntos.
- O admin tem mais modulos do que o exemplo mostrava: `AdminScanners` e `AdminPrinters`.
- Em `frontend/` existe `dist/`, que e a build gerada para producao.
- Em `backend/` existe `node_modules/`, mas ele nao faz parte da manutencao manual do codigo.

## Arquivos Chave Para Manutencao

### Backend

- `backend/server.js`
  Ponto central da API hoje.
- `backend/database_schema.sql`
  Estrutura principal do banco.
- `backend/src/config/database.js`
  Conexao com MySQL.
- `backend/src/utils/queries.js`
  Queries reaproveitadas.

### Frontend Publico

- `frontend/src/App.jsx`
  Define as rotas do site.
- `frontend/src/App.css`
  Estilos globais.
- `frontend/src/components/Home/Home.jsx`
  Pagina inicial.
- `frontend/src/components/ProductCatalog/ProductCatalog.jsx`
  Catalogo de produtos.
- `frontend/src/components/ProductDetail/ProductDetail.jsx`
  Detalhe de produto.

### Admin

- `frontend/src/pages/Admin/AdminDashboard.jsx`
  Entrada da rota `/admin`.
- `frontend/src/pages/Admin/AdminBase.css`
  Base visual do painel.
- `frontend/src/context/AdminContext.jsx`
  Estado compartilhado do admin.
- `frontend/src/hooks/`
  Regras de carregamento e CRUD.
- `frontend/src/services/`
  Comunicacao com a API.

## Regra Rapida Para Se Achar

- Quer mexer em rota publica:
  `frontend/src/App.jsx`
- Quer mexer na home:
  `frontend/src/components/Home/`
- Quer mexer em uma pagina publica:
  `frontend/src/components/NOME_DA_PASTA/`
- Quer mexer no admin:
  `frontend/src/pages/Admin/`
- Quer mexer em chamadas da API:
  `frontend/src/services/`
- Quer mexer em estado compartilhado do admin:
  `frontend/src/context/AdminContext.jsx`
- Quer mexer no backend:
  `backend/server.js`
- Quer mexer no banco:
  `backend/database_schema.sql`

## Observacao

O projeto ja esta mais organizado no frontend do que no backend.
No frontend, boa parte das paginas e componentes ja esta separada por pasta.
No backend, a estrutura de pastas existe, mas a maior parte da logica ainda esta concentrada em `server.js`.
