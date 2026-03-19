# Rotas E Componentes

Este arquivo ajuda a localizar qual componente responde por cada rota principal.

## Rotas Publicas

- `/`
  ```txt
  frontend/src/components/Home/Home.jsx
  ```
- `/produtos`
  ```txt
  frontend/src/components/ProductCatalog/ProductCatalog.jsx
  ```
- `/categoria/:slug`
  ```txt
  frontend/src/components/ProductCatalog/ProductCatalog.jsx
  ```
- `/produto/:id`
  ```txt
  frontend/src/components/ProductDetail/ProductDetail.jsx
  ```
- `/categoria/talmax-digital`
  ```txt
  frontend/src/components/TalmaxDigital/TalmaxDigital.jsx
  ```
- `/upcera`
  ```txt
  frontend/src/components/Upcera/Upcera.jsx
  ```
- `/scanners`
  ```txt
  frontend/src/components/Scanners/Scanners.jsx
  ```
- `/impressoras-3d`
  ```txt
  frontend/src/components/Impressoras3D/Impressoras3D.jsx
  ```
- `/privacidade`
  ```txt
  frontend/src/components/PrivacyPolicy/PrivacyPolicy.jsx
  ```

## Rotas Placeholder

Varias rotas institucionais usam:

```txt
frontend/src/components/PagePlaceholder/PagePlaceholder.jsx
```

## Rota Do Admin

- `/admin`
  ```txt
  frontend/src/pages/Admin/AdminDashboard.jsx
  ```
