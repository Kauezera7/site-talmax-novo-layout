# Frontend Talmax

Resumo da aplicacao React do projeto.

## Stack

- React 19
- React Router 7
- Vite 8
- Mantine
- Framer Motion
- Lucide React
- Swiper

## Estrutura principal

```txt
frontend/
|-- public/
|-- src/
|   |-- components/
|   |-- context/
|   |-- hooks/
|   |-- pages/
|   |-- services/
|   `-- utils/
`-- vite.config.js
```

Arquivos centrais:

- `src/main.jsx`
  monta a aplicacao React
- `src/App.jsx`
  define router, busca do site, layout publico e protecao do admin
- `src/services/api.js`
  resolve a base da API

## Rotas importantes

Publicas:

- `/`
- `/privacidade`
- `/quem-somos`
- `/historia-diretoria`
- `/produtos`
- `/categoria/:slug`
- `/produto/:id`
- `/categoria/talmax-digital`
- `/grupo-digital/:slug`
- `/pagina/:slug`
- `/upcera`
- `/scanners`
- `/impressoras-3d`
- `/suporte`

Admin:

- `/admin/login`
- `/admin/painel`

Algumas rotas institucionais ainda usam `PagePlaceholder` enquanto o conteudo definitivo nao foi fechado.

## Integracao com o backend

- em desenvolvimento, `src/services/api.js` aponta para a mesma maquina atual na porta `5000`
- em producao, o fallback e `/api`
- `VITE_API_URL` pode sobrescrever esse comportamento

## Build e deploy

O build usa hoje:

```js
base: '/site-talmax/'
```

Se o deploy nao acontecer nesse subdiretorio, ajuste `vite.config.js` antes de rodar `npm run build`.

## Scripts

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run lint`
