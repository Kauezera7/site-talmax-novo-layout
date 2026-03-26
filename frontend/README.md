# Frontend Talmax

Aplicacao React do projeto `site-talmax`.

## Tecnologias

- React 19
- React Router 7
- Vite
- Framer Motion
- Lucide React

## Scripts

- `npm run dev`
  Sobe o frontend em modo desenvolvimento.
- `npm run build`
  Gera a pasta `dist/`.
- `npm run preview`
  Publica localmente a build gerada.
- `npm run lint`
  Executa o ESLint.

## Estrutura

```txt
frontend/
|-- public/
|-- dist/
`-- src/
    |-- components/
    |-- context/
    |-- hooks/
    |-- pages/
    |-- services/
    `-- utils/
```

## Pontos De Entrada

- `src/main.jsx`
  Inicializa o React.
- `src/App.jsx`
  Define layout, rotas publicas, busca do site e rotas do painel.

## Integracao Com Backend

- A URL base da API fica em `src/services/api.js`.
- Em desenvolvimento, o fallback padrao e `http://localhost:5000/api`.
- Em producao, o fallback padrao e `/api`.
- Tambem e possivel definir `VITE_API_URL`.

## Rotas Do Painel

- `/admin/login`
  Tela de login
- `/admin/painel`
  Painel protegido
