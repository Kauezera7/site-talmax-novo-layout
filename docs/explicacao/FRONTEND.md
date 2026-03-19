# Frontend

## Funcao

O frontend mostra o site público e também a rota do painel administrativo.

## Estrutura Atual

```txt
frontend/
├── public/
├── src/
│   ├── App.css
│   ├── App.jsx
│   ├── data.js
│   ├── index.css
│   ├── main.jsx
│   ├── assets/
│   ├── components/
│   ├── context/
│   ├── hooks/
│   ├── pages/
│   │   └── Admin/
│   └── services/
└── dist/
```

## Parte Publica

As páginas e componentes públicos ficam em `frontend/src/components/`.

Hoje eles já estão organizados em pastas próprias, por exemplo:

- `Home/`
- `HeroSlider/`
- `CookieBanner/`
- `ProductCatalog/`
- `ProductDetail/`
- `ProductCard/`
- `Upcera/`
- `Scanners/`
- `Impressoras3D/`

## Arquivos Mais Importantes

- `App.jsx`
  Define as rotas.
- `App.css`
  Estilos globais.
- `main.jsx`
  Entrada da aplicação React.

## Regra De Organizacao

O padrão usado hoje é:

- cada componente importante fica na própria pasta
- o CSS do componente fica junto dele
- estilos globais ficam em `App.css`
