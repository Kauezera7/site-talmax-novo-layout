# Frontend

## Funcao

O frontend entrega duas experiencias:

- site publico da Talmax
- painel administrativo acessado pelo navegador

Ele foi construido com React, React Router e Vite.

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
  Define o router, layout publico, tema do admin, busca e protecao das rotas do painel.
- `src/App.css`
  Estilos globais da aplicacao.
- `src/services/api.js`
  Define a base da API via `VITE_API_URL` ou fallback local.

## Parte Publica

As paginas publicas ficam principalmente em:

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

## Rotas Publicas Reais

As rotas registradas hoje em `App.jsx` sao:

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

Parte dessas rotas usa `PagePlaceholder` enquanto o conteudo definitivo nao existe.

## Admin No Frontend

As rotas do painel definidas no frontend sao:

- `/admin`
  Redireciona para `/admin/login`
- `/admin/login`
  Tela de autenticacao
- `/admin/painel`
  Painel protegido por validacao de sessao

Arquivos importantes:

- `src/components/AdminLogin/AdminLogin.jsx`
- `src/services/adminAuth.js`
- `src/services/adminSessionEvents.js`
- `src/pages/Admin/AdminDashboard.jsx`

## Services Do Frontend

Os services ficam em:

```txt
frontend/src/services/
```

Arquivos principais:

- `api.js`
  URL base da API.
- `adminAuth.js`
  Login, validacao de sessao e logout.
- `adminRequest.js`
  Utilitarios de requisicao autenticada.
- `bannerService.js`
- `categoryService.js`
- `productService.js`

## Regra De Organizacao

O padrao atual do frontend e:

- cada componente importante fica em uma pasta propria
- o CSS da feature fica junto do componente
- rotas e layout principal ficam em `App.jsx`
- telas internas do painel ficam em `src/pages/Admin/`
- integracoes com backend ficam em `src/services/`
