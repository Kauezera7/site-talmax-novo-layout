# API do Projeto

Este documento descreve os endpoints ativos do backend no estado atual do projeto.

Base da API:

GET	= Buscar
POST	= Criar
PUT	= Atualizar tudo
PATCH	= Atualizar parte
DELETE	= Deletar

- desenvolvimento: `http://localhost:5000/api`
- produção: `/api`

## Autenticação

O painel administrativo usa sessão via cookie HTTP-only.

- cookie: `talmax-admin-session`
- algoritmo do token: HMAC SHA-256
- tempo padrão de expiração: 8 horas

Endpoints protegidos exigem sessão válida.

## Endpoints

### Admin

#### `POST /api/admin/login`

Função:

- autentica o usuário do painel
- grava o cookie de sessão

Body JSON:

```json
{
  "username": "admin",
  "password": "talmax123"
}
```

Resposta `200`:

```json
{
  "user": {
    "id": 1,
    "username": "admin",
    "full_name": "Administrador Talmax",
    "created_at": "2026-03-26T00:00:00.000Z"
  }
}
```

Erros comuns:

- `400` usuário ou senha ausentes
- `401` credenciais inválidas

#### `GET /api/admin/session`

Função:

- valida a sessão atual do admin

Autenticação:

- obrigatória

Resposta `200`:

```json
{
  "user": {
    "id": 1,
    "username": "admin",
    "full_name": "Administrador Talmax",
    "created_at": "2026-03-26T00:00:00.000Z",
    "iat": 0,
    "exp": 0
  }
}
```

Erros comuns:

- `401` sessão inválida ou expirada

#### `POST /api/admin/logout`

Função:

- encerra a sessão do admin

Autenticação:

- obrigatória

Resposta `200`:

```json
{
  "message": "Logout realizado com sucesso."
}
```

### Categorias

#### `GET /api/categories`

Função:

- lista categorias e subcategorias em um único array

Resposta `200`:

```json
[
  {
    "id": 13,
    "name": "Talmax Digital",
    "slug": "talmax-digital",
    "icon_url": null,
    "display_order": 13,
    "is_visible": 0,
    "parent_id": null
  }
]
```

Observação:

- quando `parent_id` vier preenchido, o item representa uma subcategoria

#### `POST /api/categories`

Função:

- cria categoria ou subcategoria

Autenticação:

- obrigatória

Content-Type:

- `multipart/form-data`

Campos:

- `name`
- `slug`
- `is_visible`
- `parent_id`
- `icon` para categoria principal

Regra:

- se `parent_id` vier preenchido, o backend cria uma subcategoria

Resposta `201`:

```json
{
  "message": "Categoria criada!"
}
```

ou

```json
{
  "message": "Subcategoria criada!"
}
```

#### `PUT /api/categories/:id`

Função:

- atualiza categoria ou subcategoria

Autenticação:

- obrigatória

Content-Type:

- `multipart/form-data`

Campos:

- `name`
- `slug`
- `is_visible`
- `parent_id`
- `icon` opcional

#### `DELETE /api/categories/:id`

Função:

- exclui categoria ou subcategoria

Autenticação:

- obrigatória

Resposta `200`:

```json
{
  "message": "Categoria/Subcategoria excluída com sucesso!"
}
```

### Banners

#### `GET /api/banners`

Função:

- lista banners em ordem de exibição

Resposta `200`:

```json
[
  {
    "id": 1,
    "title": "Banner principal",
    "image_url": "/img/banner.webp",
    "link_url": "https://exemplo.com",
    "display_order": 0,
    "active": 1
  }
]
```

#### `POST /api/banners`

Função:

- cria banner

Autenticação:

- obrigatória

Content-Type:

- `multipart/form-data`

Campos:

- `title`
- `link_url`
- `display_order`
- `active`
- `image` obrigatória

Resposta `201`:

```json
{
  "message": "Banner criado!"
}
```

#### `PUT /api/banners/:id`

Função:

- atualiza banner existente

Autenticação:

- obrigatória

Content-Type:

- `multipart/form-data`

Campos:

- `title`
- `link_url`
- `display_order`
- `active`
- `image` opcional

#### `DELETE /api/banners/:id`

Função:

- exclui banner

Autenticação:

- obrigatória

Resposta `200`:

```json
{
  "message": "Banner excluído!"
}
```

### Produtos

#### `GET /api/products`

Função:

- lista produtos com dados de categorias agregados

Resposta `200`:

```json
[
  {
    "id": 1,
    "name": "Produto",
    "description": "Descrição",
    "main_image": "/img/produto.webp",
    "extra_data": "{}",
    "category_names": "Talmax Digital, Upcera",
    "category_ids": [13],
    "sub_category_ids": [61],
    "is_upcera": true,
    "is_scanner": false,
    "is_3d_printer": false
  }
]
```

#### `GET /api/products/:id`

Função:

- retorna um produto específico

Erros comuns:

- `404` produto não encontrado

#### `POST /api/products`

Função:

- cria produto com imagens e relacionamento com categorias

Autenticação:

- obrigatória

Content-Type:

- `multipart/form-data`

Campos principais:

- `name`
- `description`
- `category_ids`
- `sub_category_ids`
- `extra_data`
- `primary_image_index`
- `images` com até 20 arquivos

Validações relevantes:

- impede produto duplicado por nome
- exige pelo menos uma imagem
- exige pelo menos uma categoria principal válida

Resposta `201`:

```json
{
  "message": "Produto criado!"
}
```

Erros comuns:

- `400` sem imagem
- `400` sem categoria principal
- `409` nome duplicado

#### `PUT /api/products/:id`

Função:

- atualiza produto existente

Autenticação:

- obrigatória

Content-Type:

- `multipart/form-data`

Campos principais:

- `name`
- `description`
- `category_ids`
- `sub_category_ids`
- `extra_data`
- `primary_image_index`
- `images`

Observação:

- o backend mistura imagens retidas e novas com base em `extra_data`

#### `DELETE /api/products/:id`

Função:

- exclui produto

Autenticação:

- obrigatória

Resposta `200`:

```json
{
  "message": "Produto excluído!"
}
```

### Seções Especiais

Esses endpoints atualizam os produtos destacados das páginas especiais.

Autenticação:

- obrigatória em todos

Body JSON padrão:

```json
{
  "selected_products": [
    {
      "id": 1,
      "order": 0,
      "displayMode": "features"
    }
  ]
}
```

Valores aceitos em `displayMode`:

- `description`
- `features`
- `none`

#### `PUT /api/upcera/products`

Resposta `200`:

```json
{
  "message": "Produtos Upcera atualizados com sucesso!"
}
```

#### `PUT /api/scanners/products`

Resposta `200`:

```json
{
  "message": "Produtos Scanners atualizados com sucesso!"
}
```

#### `PUT /api/3d-printers/products`

Resposta `200`:

```json
{
  "message": "Produtos Impressoras 3D atualizados com sucesso!"
}
```

## Erros e Comportamentos Gerais

- `401`
  sessão inválida ou expirada em rotas protegidas
- `400`
  validação de entrada ou erro de upload
- `404`
  recurso não encontrado
- `409`
  conflito de negócio, como nome de produto duplicado
- `500`
  erro interno

Uploads:

- tipos permitidos: JPG, PNG, WEBP, GIF e SVG
- limite por arquivo: 5 MB
- limite de arquivos por upload: 20

## Arquivos Relacionados

- `backend/src/server/app.js`
- `backend/src/server/routes/adminAuthRoutes.js`
- `backend/src/server/routes/categoryRoutes.js`
- `backend/src/server/routes/bannerRoutes.js`
- `backend/src/server/routes/productRoutes.js`
- `backend/src/server/routes/specialSectionRoutes.js`
