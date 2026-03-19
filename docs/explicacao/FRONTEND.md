# Frontend

## Funcao

O frontend mostra o site publico e tambem a rota do painel administrativo.

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

As paginas e componentes publicos ficam neste caminho:

```txt
frontend/src/components/
```

Hoje eles ja estao organizados em pastas proprias, por exemplo:

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
  Entrada da aplicacao React.

## Regra De Organizacao

O padrao usado hoje e:

- cada componente importante fica na propria pasta
- o CSS do componente fica junto dele
- estilos globais ficam em `App.css`
