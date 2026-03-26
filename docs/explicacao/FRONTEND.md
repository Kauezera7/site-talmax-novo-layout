# Frontend

## Função

O frontend entrega duas experiências:

- site público da Talmax
- painel administrativo acessado pelo navegador

Ele foi construído com React, React Router e Vite.

## Estrutura Atual

```txt
frontend/
|-- public/
|-- dist/
`-- src/
    |-- App.jsx
    |-- App.css
    |-- main.jsx
    |-- components/
    |-- context/
    |-- hooks/
    |-- pages/
    |-- services/
    `-- utils/
```

## Arquivos Mais Importantes

- `src/main.jsx`
  Entrada do React.
- `src/App.jsx`
  Define o router, layout público, tema do admin, busca e proteção das rotas do painel.
- `src/App.css`
  Estilos globais da aplicação.
- `src/services/api.js`
  Define a base da API via `VITE_API_URL` ou fallback local.

## Parte Pública

As páginas públicas ficam principalmente em:

```txt
frontend/src/components/
```

Pastas principais usadas hoje:

- `Home/`
- `QuemSomos/`
- `HistoriaDiretoria/`
- `ProductCatalog/`
- `ProductDetail/`
- `TalmaxDigital/`
- `Upcera/`
- `Scanners/`
- `Impressoras3D/`
- `Support/`
- `PrivacyPolicy/`
- `PagePlaceholder/`
- `CookieBanner/`

## Rotas Públicas Reais

As rotas registradas hoje em `App.jsx` são:

- `/`
- `/privacidade`
- `/quem-somos`
- `/historia-diretoria`
- `/depoimentos`
- `/produtos`
- `/categoria/talmax-digital`
- `/categoria/:slug`
- `/produto/:id`
- `/upcera`
- `/scanners`
- `/impressoras-3d`
- `/blog`
- `/suporte`
- `/assistencia-tecnica`
- `/contato`
- `/comercial-comex`
- `/cursos`
- `/portal-cliente`
- `/sac`
- `/politicas-troca`

Parte dessas rotas usa `PagePlaceholder` enquanto o conteúdo definitivo não existe.

## Admin no Frontend

As rotas do painel definidas no frontend são:

- `/admin`
  Redireciona para `/admin/login`
- `/admin/login`
  Tela de autenticação
- `/admin/painel`
  Painel protegido por validação de sessão

Arquivos importantes:

- `src/components/AdminLogin/AdminLogin.jsx`
- `src/services/adminAuth.js`
- `src/services/adminSessionEvents.js`
- `src/pages/Admin/AdminDashboard.jsx`

## Services do Frontend

Os services ficam em:

```txt
frontend/src/services/
```

Arquivos principais:

- `api.js`
  URL base da API.
- `adminAuth.js`
  Login, validação de sessão e logout.
- `adminRequest.js`
  Utilitários de requisição autenticada.
- `bannerService.js`
- `categoryService.js`
- `productService.js`

## Regra de Organização

O padrão atual do frontend é:

- cada componente importante fica em uma pasta própria
- o CSS da feature fica junto do componente
- rotas e layout principal ficam em `App.jsx`
- telas internas do painel ficam em `src/pages/Admin/`
- integrações com backend ficam em `src/services/`
