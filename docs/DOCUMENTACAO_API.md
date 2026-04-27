# Documentacao da API - Talmax

## Visao geral

- Prefixo base de todas as rotas: `/api`
- Total atual mapeado no codigo: `47 endpoints`
- Grupos de rotas: `10`
- Fonte principal desta documentacao:
  - `backend/src/server/app.js`
  - `backend/src/server/routes/*.js`
  - `backend/src/server/services/productService.js`
  - `backend/src/server/validation/*.js`

### Mapa rapido

| Grupo | Prefixo | Endpoints | Acesso predominante |
| --- | --- | ---: | --- |
| Admin | `/api/admin` | 7 | publico, admin, master |
| Categorias | `/api/categories` | 4 | publico + admin |
| Banners | `/api/banners` | 4 | publico + admin |
| Produtos | `/api/products` | 7 | publico + admin |
| Servicos da home | `/api/home-services` | 5 | publico + admin |
| Assistencia tecnica | `/api/technical-assistance` | 4 | publico + admin |
| Configuracoes de pagina | `/api/page-settings` | 2 | publico + admin |
| Paginas personalizadas | `/api/custom-pages` | 5 | admin + publico por slug |
| Grupos digitais | `/api/digital-groups` | 5 | publico + admin |
| Secoes especiais | `/api` | 4 | admin |

## Autenticacao

- O painel admin usa cookie HTTP-only, nao Bearer token.
- Nome do cookie de sessao: `talmax-admin-session`
- Fluxo padrao:
  1. `POST /api/admin/login`
  2. O backend grava o cookie de sessao
  3. As rotas protegidas usam esse cookie automaticamente
- Niveis de acesso usados no backend:
  - `Publico`: sem login
  - `Admin autenticado`: qualquer admin logado
  - `Admin master`: apenas admin com `role = master`

### Perfis de admin

| Campo | Tipo | Observacao |
| --- | --- | --- |
| `id` | numero | id do usuario na tabela `users` |
| `username` | string | login do admin |
| `full_name` | string | nome exibido no painel |
| `email` | string or `null` | exige migration de identidade do admin |
| `role` | string | `master` ou `editor` |
| `bloq_user` | numero | `1 = livre`, `2 = bloqueado temporariamente` |
| `created_at` | string or `null` | timestamp do cadastro |

## Padroes gerais

### Content-Type

- `application/json`: maioria das rotas
- `multipart/form-data`: rotas com upload

### Booleans aceitos nas validacoes

Nas rotas validadas com schema, o backend aceita:

- `true` / `false`
- `1` / `0`
- `yes` / `no`
- `sim` / `nao`
- `on` / `off`

### Campos JSON enviados em multipart

Quando a rota usa `multipart/form-data`, campos complexos devem ser enviados como string JSON.

Campos mais comuns:

- `category_ids`
- `sub_category_ids`
- `extra_data`
- `actions`
- `product_ids`
- `cards`
- `selected_products`

### Padrao de erro

Erros simples normalmente retornam:

```json
{
  "error": "Mensagem do erro."
}
```

Erros de validacao mais detalhados podem retornar:

```json
{
  "error": "Dados invalidos.",
  "details": [
    {
      "field": "campo",
      "message": "Descricao do problema."
    }
  ]
}
```

Status mais comuns:

| Status | Quando aparece |
| --- | --- |
| `400` | payload invalido, campos faltando ou id invalido |
| `401` | sessao ausente, invalida ou expirada |
| `403` | admin sem permissao master |
| `404` | recurso nao encontrado |
| `409` | conflito, como slug ou usuario duplicado |
| `429` | excesso de tentativas de login |
| `503` | tabela/migration ainda indisponivel em producao |

## 1. Admin

Prefixo: `/api/admin`

| Metodo | Rota | Acesso | Content-Type | Descricao |
| --- | --- | --- | --- | --- |
| `POST` | `/login` | Publico | `application/json` | Faz login do admin |
| `POST` | `/login-unlock` | Master | `application/json` | Desbloqueia login de um admin |
| `GET` | `/session` | Admin | `application/json` | Retorna a sessao atual |
| `GET` | `/users` | Master | `application/json` | Lista usuarios admin |
| `POST` | `/users` | Master | `application/json` | Cria usuario admin |
| `PUT` | `/users/:id` | Master | `application/json` | Atualiza usuario admin |
| `POST` | `/logout` | Admin | `application/json` | Encerra a sessao atual |

### POST /api/admin/login

- Acesso: `Publico`
- Body:

| Campo | Tipo | Obrigatorio | Observacao |
| --- | --- | --- | --- |
| `username` | string | Sim | aceita usuario ou e-mail |
| `password` | string | Sim | senha do admin |

- Resposta `200`:

```json
{
  "user": {
    "id": 1,
    "username": "master",
    "full_name": "Admin Master",
    "email": "admin@empresa.com",
    "role": "master",
    "bloq_user": 1,
    "created_at": "2026-04-17T12:00:00.000Z"
  }
}
```

- Erros comuns:
  - `400`: faltou usuario/e-mail ou senha
  - `401`: credenciais invalidas
  - `429`: usuario temporariamente bloqueado, com `retry_after_seconds`

### POST /api/admin/login-unlock

- Acesso: `Admin master`
- Body:

| Campo | Tipo | Obrigatorio | Observacao |
| --- | --- | --- | --- |
| `username` | string | Sim | aceita usuario ou e-mail do admin a liberar |

- Resposta `200`:

```json
{
  "message": "Usuario desbloqueado com sucesso. Oriente a pessoa a recarregar a pagina e tentar de novo.",
  "user": {
    "id": 2,
    "username": "editor",
    "full_name": "Editor",
    "email": "editor@empresa.com",
    "role": "editor",
    "bloq_user": 1,
    "created_at": "2026-04-17T12:00:00.000Z"
  }
}
```

- Erros comuns:
  - `400`: body sem usuario/e-mail
  - `404`: admin nao encontrado
  - `503`: coluna `bloq_user` ausente na tabela `users`

### GET /api/admin/session

- Acesso: `Admin autenticado`
- Resposta `200`:

```json
{
  "user": {
    "id": 1,
    "username": "master",
    "full_name": "Admin Master",
    "email": "admin@empresa.com",
    "role": "master",
    "bloq_user": 1,
    "created_at": "2026-04-17T12:00:00.000Z"
  }
}
```

- Erros comuns:
  - `401`: cookie ausente, invalido ou expirado

### GET /api/admin/users

- Acesso: `Admin master`
- Resposta `200`:

```json
{
  "users": [
    {
      "id": 1,
      "username": "master",
      "full_name": "Admin Master",
      "email": "admin@empresa.com",
      "role": "master",
      "bloq_user": 1,
      "created_at": "2026-04-17T12:00:00.000Z"
    }
  ]
}
```

- Observacao: depende das colunas `email` e `role` na tabela `users`.

### POST /api/admin/users

- Acesso: `Admin master`
- Body:

| Campo | Tipo | Obrigatorio | Regra |
| --- | --- | --- | --- |
| `full_name` | string | Sim | max `100` |
| `email` | string | Sim | max `160`, precisa ser valido |
| `username` | string | Sim | `3-50`, aceita letras, numeros, `.`, `_`, `-` |
| `password` | string | Sim | `6-100` caracteres |
| `role` | string | Sim | `master` ou `editor` |

- Resposta `201`:

```json
{
  "message": "Usuario admin criado com sucesso.",
  "user": {
    "id": 2,
    "username": "editor",
    "full_name": "Editor",
    "email": "editor@empresa.com",
    "role": "editor",
    "bloq_user": 1,
    "created_at": "2026-04-17T12:00:00.000Z"
  }
}
```

- Erros comuns:
  - `409`: username ou e-mail ja cadastrado
  - `503`: migration de identidade de admin nao aplicada

### PUT /api/admin/users/:id

- Acesso: `Admin master`
- Path params:

| Param | Tipo | Obrigatorio |
| --- | --- | --- |
| `id` | numero | Sim |

- Body: envie um ou mais campos abaixo

| Campo | Tipo | Obrigatorio | Regra |
| --- | --- | --- | --- |
| `full_name` | string | Nao | max `100` |
| `email` | string | Nao | max `160`, valido |
| `username` | string | Nao | `3-50` |
| `password` | string | Nao | `6-100` |
| `role` | string | Nao | `master` ou `editor` |

- Resposta `200`:

```json
{
  "message": "Usuario admin atualizado com sucesso.",
  "user": {
    "id": 2,
    "username": "editor",
    "full_name": "Editor Atualizado",
    "email": "editor@empresa.com",
    "role": "editor",
    "bloq_user": 1,
    "created_at": "2026-04-17T12:00:00.000Z"
  }
}
```

- Regras importantes:
  - precisa enviar pelo menos um campo
  - o master logado nao pode remover o proprio papel `master`

### POST /api/admin/logout

- Acesso: `Admin autenticado`
- Body: vazio
- Resposta `200`:

```json
{
  "message": "Logout realizado com sucesso."
}
```

## 2. Categorias

Prefixo: `/api/categories`

| Metodo | Rota | Acesso | Content-Type | Descricao |
| --- | --- | --- | --- | --- |
| `GET` | `/` | Publico | `application/json` | Lista categorias e subcategorias |
| `POST` | `/` | Admin | `multipart/form-data` | Cria categoria ou subcategoria |
| `PUT` | `/:id` | Admin | `multipart/form-data` | Atualiza categoria ou subcategoria |
| `DELETE` | `/:id` | Admin | `application/json` | Exclui categoria ou subcategoria |

### GET /api/categories

- Acesso: `Publico`
- Resposta `200`: array misto com categorias e subcategorias

| Campo | Tipo | Observacao |
| --- | --- | --- |
| `id` | numero | id do item |
| `name` | string | nome |
| `slug` | string | slug |
| `icon_url` | string | apenas categorias principais usam icone |
| `display_order` | numero | ordem atual |
| `is_visible` | boolean/numero | visibilidade atual |
| `parent_id` | numero or `null` | `null` para categoria principal, id da categoria para subcategoria |

- Observacao: a rota retorna tudo; o frontend decide como usar `is_visible`.

### POST /api/categories

- Acesso: `Admin autenticado`
- Content-Type: `multipart/form-data`
- Campos:

| Campo | Tipo | Obrigatorio | Observacao |
| --- | --- | --- | --- |
| `name` | string | Sim | max `160` |
| `slug` | string | Sim | max `180` |
| `is_visible` | boolean-like | Nao | default `true` |
| `parent_id` | numero | Nao | se enviado, cria `subcategoria` |
| `icon` | arquivo | Nao | usado apenas para categoria principal |

- Resposta `201`:
  - categoria principal: `{ "message": "Categoria criada!" }`
  - subcategoria: `{ "message": "Subcategoria criada!" }`

### PUT /api/categories/:id

- Acesso: `Admin autenticado`
- Content-Type: `multipart/form-data`
- Path params:

| Param | Tipo | Obrigatorio |
| --- | --- | --- |
| `id` | numero | Sim |

- Campos: mesmos do `POST`
- Regra importante:
  - para atualizar uma `subcategoria`, envie `parent_id`
  - sem `parent_id`, a rota atualiza uma `categoria principal`

- Resposta `200`:
  - categoria principal: `{ "message": "Categoria atualizada!" }`
  - subcategoria: `{ "message": "Subcategoria atualizada!" }`

### DELETE /api/categories/:id

- Acesso: `Admin autenticado`
- Path params:

| Param | Tipo | Obrigatorio |
| --- | --- | --- |
| `id` | numero | Sim |

- Resposta `200`:

```json
{
  "message": "Categoria/Subcategoria excluida com sucesso!"
}
```

- Observacao: a rota tenta apagar o mesmo `id` tanto em `sub_categorias` quanto em `categorias`.

## 3. Banners

Prefixo: `/api/banners`

| Metodo | Rota | Acesso | Content-Type | Descricao |
| --- | --- | --- | --- | --- |
| `GET` | `/` | Publico | `application/json` | Lista banners |
| `POST` | `/` | Admin | `multipart/form-data` | Cria banner |
| `PUT` | `/:id` | Admin | `multipart/form-data` | Atualiza banner |
| `DELETE` | `/:id` | Admin | `application/json` | Exclui banner |

### GET /api/banners

- Acesso: `Publico`
- Resposta `200`: array

| Campo | Tipo | Observacao |
| --- | --- | --- |
| `id` | numero | id do banner |
| `title` | string | titulo atual |
| `subtitle` | string | pode existir no retorno se a coluna existir |
| `image_url` | string | URL da imagem |
| `link_url` | string | URL ou rota relativa |
| `display_order` | numero | ordem de exibicao |
| `active` | boolean/numero | status |

- Observacao importante:
  - `subtitle` pode ser lido, mas a API atual nao possui campo de escrita para ele

### POST /api/banners

- Acesso: `Admin autenticado`
- Content-Type: `multipart/form-data`
- Campos:

| Campo | Tipo | Obrigatorio | Observacao |
| --- | --- | --- | --- |
| `image` | arquivo | Sim | imagem do banner |
| `title` | string | Nao | max `255` |
| `link_url` | string | Nao | URL ou rota relativa valida |
| `display_order` | numero | Nao | default `0` |
| `active` | boolean-like | Nao | default `true` |

- Resposta `201`:

```json
{
  "message": "Banner criado!"
}
```

### PUT /api/banners/:id

- Acesso: `Admin autenticado`
- Content-Type: `multipart/form-data`
- Path params:

| Param | Tipo | Obrigatorio |
| --- | --- | --- |
| `id` | numero | Sim |

- Campos: mesmos do `POST`
- Diferenca:
  - `image` e opcional na atualizacao

- Resposta `200`:

```json
{
  "message": "Banner atualizado!"
}
```

### DELETE /api/banners/:id

- Acesso: `Admin autenticado`
- Resposta `200`:

```json
{
  "message": "Banner excluido!"
}
```

## 4. Produtos

Prefixo: `/api/products`

| Metodo | Rota | Acesso | Content-Type | Descricao |
| --- | --- | --- | --- | --- |
| `GET` | `/` | Publico | `application/json` | Lista produtos ou retorna paginacao |
| `GET` | `/:id` | Publico | `application/json` | Busca produto por id |
| `POST` | `/` | Admin | `multipart/form-data` | Cria produto |
| `PUT` | `/:id` | Admin | `multipart/form-data` | Atualiza produto |
| `DELETE` | `/:id` | Admin | `application/json` | Exclui produto |
| `PUT` | `/:id/active` | Admin | `application/json` | Ativa ou inativa produto |
| `PUT` | `/:id/quote-button` | Admin | `application/json` | Liga/desliga botao de orcamento |

### Shape base de produto

As rotas de leitura retornam um produto com este formato base:

| Campo | Tipo | Observacao |
| --- | --- | --- |
| `id` | numero | id do produto |
| `name` | string | nome |
| `description` | string | descricao principal |
| `main_image` | string | primeira imagem do conjunto |
| `category_names` | string | nomes concatenados |
| `category_ids` | numero[] | ids das categorias principais |
| `sub_category_ids` | numero[] | ids das subcategorias |
| `is_active` | boolean | status |
| `is_featured` | boolean | produto em destaque |
| `is_upcera` | boolean | produto selecionado para Upcera |
| `is_scanner` | boolean | produto selecionado para Scanners |
| `is_3d_printer` | boolean | produto selecionado para Impressoras 3D |
| `extra_data` | objeto | configuracoes extras do produto |
| `product_tabs` | array | abas adicionais ativas do produto |

### GET /api/products

- Acesso: `Publico`
- Query params:

| Param | Tipo | Obrigatorio | Observacao |
| --- | --- | --- | --- |
| `include_inactive` | boolean-like | Nao | inclui produtos inativos |
| `page` | numero | Nao | se presente, ativa modo paginado |
| `limit` | numero | Nao | max `60` |
| `search` | string | Nao | busca por nome ou categoria |
| `category_slugs` | string ou array | Nao | aceita JSON array ou string CSV |

- Comportamento:
  - sem `page`, `limit`, `search` ou `category_slugs`: retorna `array de produtos`
  - com qualquer um desses params: retorna objeto paginado

- Resposta paginada `200`:

```json
{
  "items": [],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 0,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

### GET /api/products/:id

- Acesso: `Publico`
- Query params:

| Param | Tipo | Obrigatorio | Observacao |
| --- | --- | --- | --- |
| `include_inactive` | boolean-like | Nao | inclui produto inativo |

- Resposta `200`: um produto no shape base
- Erro comum:
  - `404`: produto nao encontrado

### POST /api/products

- Acesso: `Admin autenticado`
- Content-Type: `multipart/form-data`
- Upload:
  - `images`: ate `20` arquivos por request
- Campos simples:

| Campo | Tipo | Obrigatorio | Observacao |
| --- | --- | --- | --- |
| `name` | string | Sim | max `255` |
| `description` | string | Nao | max `50000` |
| `primary_image_index` | numero | Nao | indice da imagem principal |
| `is_active` | boolean-like | Nao | default `true` |

- Campos JSON:

| Campo | Tipo | Obrigatorio | Observacao |
| --- | --- | --- | --- |
| `category_ids` | numero[] | Sim | pelo menos `1` categoria principal |
| `sub_category_ids` | numero[] | Nao | subcategorias daquelas categorias |
| `extra_data` | objeto | Sim | configuracoes detalhadas do produto |

- Estrutura principal de `extra_data`:

```json
{
  "descriptionTabLabel": "Descricao",
  "descriptionAsList": false,
  "technicalTabLabel": "Dados tecnicos",
  "showFeatures": true,
  "hideModelData": false,
  "showModelSection": true,
  "showQuoteButton": true,
  "features": ["Item 1", "Item 2"],
  "techSpecs": [
    { "label": "Peso", "value": "2 kg" }
  ],
  "product_tabs": [
    {
      "title": "Aplicacoes",
      "content": "Conteudo da aba",
      "contentAsList": false,
      "videoUrl": "",
      "showContentWithVideo": true
    }
  ],
  "modelTables": [
    {
      "title": "Modelos",
      "modelTable": {
        "headers": ["Tipo", "Codigo"],
        "rows": [["A", "001"]],
        "mergeRanges": [],
        "mergedHeader": false,
        "mergedHeaderEndColumn": 0
      }
    }
  ],
  "images": [],
  "removedImages": [],
  "specialSectionDisplay": {
    "upcera": "features",
    "scanners": "description",
    "printers": "none"
  }
}
```

- Observacoes de `extra_data`:
  - `dynamicSections` e aceito como alias legado de `product_tabs`
  - `modelTitle` e `modelTable` tambem sao aceitos como formato legado
  - `images` representa imagens mantidas
  - `removedImages` so faz sentido no `PUT`
  - `specialSectionDisplay` aceita apenas `description`, `features` ou `none`

- Regras importantes:
  - maximo de imagens armazenadas por produto: `50`
  - precisa haver ao menos `1` imagem final
  - nao pode duplicar nome de produto
  - as subcategorias precisam pertencer as categorias principais informadas

- Resposta `201`:

```json
{
  "message": "Produto criado!"
}
```

### PUT /api/products/:id

- Acesso: `Admin autenticado`
- Content-Type: `multipart/form-data`
- Path params:

| Param | Tipo | Obrigatorio |
| --- | --- | --- |
| `id` | numero | Sim |

- Campos e uploads: mesmos do `POST`
- Comportamento adicional:
  - pode manter imagens antigas via `extra_data.images`
  - pode remover imagens antigas via `extra_data.removedImages`
  - o backend recalcula a imagem principal conforme `primary_image_index`

- Resposta `200`:

```json
{
  "message": "Produto atualizado!"
}
```

### DELETE /api/products/:id

- Acesso: `Admin autenticado`
- Resposta `200`:

```json
{
  "message": "Produto excluido!"
}
```

### PUT /api/products/:id/active

- Acesso: `Admin autenticado`
- Body:

| Campo | Tipo | Obrigatorio |
| --- | --- | --- |
| `is_active` | boolean-like | Sim |

- Resposta `200`:

```json
{
  "message": "Produto ativado!"
}
```

ou

```json
{
  "message": "Produto inativado!"
}
```

### PUT /api/products/:id/quote-button

- Acesso: `Admin autenticado`
- Body:

| Campo | Tipo | Obrigatorio | Regra |
| --- | --- | --- | --- |
| `showQuoteButton` | boolean-like | Sim | liga/desliga botao de orcamento |

- Resposta `200`:

```json
{
  "message": "Botao de orcamento atualizado!"
}
```

## 5. Servicos da Home

Prefixo: `/api/home-services`

| Metodo | Rota | Acesso | Content-Type | Descricao |
| --- | --- | --- | --- | --- |
| `GET` | `/` | Publico | `application/json` | Lista cards/servicos da home |
| `POST` | `/` | Admin | `multipart/form-data` | Cria servico |
| `PUT` | `/:id` | Admin | `multipart/form-data` | Atualiza servico |
| `DELETE` | `/:id` | Admin | `application/json` | Remove servico |
| `PUT` | `/:id/active` | Admin | `application/json` | Ativa ou oculta servico |

### Shape base de servico

| Campo | Tipo | Observacao |
| --- | --- | --- |
| `id` | numero | id do servico |
| `name` | string | titulo |
| `description` | string | texto livre |
| `image_url` | string | imagem do card |
| `link_url` | string | URL final resolvida |
| `link_target_type` | string or `null` | `custom-page` ou `digital-group` |
| `custom_page_id` | numero or `null` | pagina vinculada |
| `custom_page_title` | string | titulo da pagina vinculada |
| `digital_group_id` | numero or `null` | grupo digital vinculado |
| `digital_group_title` | string | titulo do grupo vinculado |
| `is_external` | boolean | link externo ou nao |
| `display_order` | numero | ordem |
| `active` | boolean | status |
| `actions` | array ou objeto | botoes, cards digitais ou grupos digitais |

### GET /api/home-services

- Acesso: `Publico`
- Resposta `200`: array no shape base
- Observacao importante:
  - a rota nao filtra `active` no backend; o retorno inclui o campo para o frontend decidir

### POST /api/home-services

- Acesso: `Admin autenticado`
- Content-Type: `multipart/form-data`
- Uploads:
  - `image`: imagem principal do servico
  - `digital_card_front_<cardId>` / `digital_card_back_<cardId>`: imagens de cards digitais
  - `digital_group_card_front_<cardId>` / `digital_group_card_back_<cardId>`: imagens de cards dentro de grupos digitais

- Campos simples:

| Campo | Tipo | Obrigatorio | Observacao |
| --- | --- | --- | --- |
| `name` | string | Nao | titulo do card |
| `description` | string | Nao | descricao |
| `image_url` | string | Nao | usado se nao houver upload `image` |
| `link_url` | string | Nao | rota relativa ou URL |
| `is_external` | boolean-like | Nao | default `false` |
| `display_order` | numero | Nao | default `0` |
| `active` | boolean-like | Nao | default `true` |
| `link_target_type` | string | Nao | `custom-page` ou `digital-group` |
| `custom_page_id` | numero | Nao | usado quando `link_target_type = custom-page` |
| `digital_group_id` | numero | Nao | usado quando `link_target_type = digital-group` |

- Campo JSON:

| Campo | Tipo | Obrigatorio | Observacao |
| --- | --- | --- | --- |
| `actions` | array ou objeto | Nao | configuracao de botoes/cards extras |

- Estruturas aceitas em `actions`:

```json
[
  { "label": "Saiba mais", "href": "/pagina/exemplo", "external": false }
]
```

ou

```json
{
  "buttons": [
    { "label": "Abrir", "href": "/pagina/exemplo", "external": false }
  ],
  "digital_cards": [
    {
      "id": "card-1",
      "title": "Card",
      "description": "Descricao",
      "link_url": "/pagina/exemplo",
      "is_external": false,
      "front_image_url": "/img/frente.png",
      "back_image_url": "/img/verso.png"
    }
  ],
  "digital_groups": [
    {
      "id": "group-1",
      "title": "Grupo",
      "description": "Descricao",
      "cards": []
    }
  ]
}
```

- Resposta `201`:

```json
{
  "id": 1,
  "message": "Servico criado com sucesso"
}
```

### PUT /api/home-services/:id

- Acesso: `Admin autenticado`
- Content-Type: `multipart/form-data`
- Path params:

| Param | Tipo | Obrigatorio |
| --- | --- | --- |
| `id` | numero | Sim |

- Campos e uploads: mesmos do `POST`
- Observacoes:
  - se `image` nao for enviado, o backend mantem `image_url` atual
  - se `link_target_type` apontar para `custom-page` ou `digital-group`, o backend resolve a URL final automaticamente

- Resposta `200`:

```json
{
  "message": "Servico atualizado com sucesso"
}
```

### DELETE /api/home-services/:id

- Acesso: `Admin autenticado`
- Resposta `200`:

```json
{
  "message": "Servico removido com sucesso"
}
```

### PUT /api/home-services/:id/active

- Acesso: `Admin autenticado`
- Body:

| Campo | Tipo | Obrigatorio |
| --- | --- | --- |
| `active` | boolean-like | Sim |

- Resposta `200`:

```json
{
  "message": "Servico ativado com sucesso"
}
```

ou

```json
{
  "message": "Servico ocultado com sucesso"
}
```

## 6. Assistencia Tecnica

Prefixo: `/api/technical-assistance`

| Metodo | Rota | Acesso | Content-Type | Descricao |
| --- | --- | --- | --- | --- |
| `GET` | `/` | Publico | `application/json` | Lista unidades de assistencia |
| `POST` | `/` | Admin | `application/json` | Cria card de assistencia |
| `PUT` | `/:id` | Admin | `application/json` | Atualiza card de assistencia |
| `DELETE` | `/:id` | Admin | `application/json` | Remove card de assistencia |

### Shape base

| Campo | Tipo | Observacao |
| --- | --- | --- |
| `id` | numero | id do card |
| `company` | string | nome da empresa |
| `address` | string | endereco |
| `city` | string | cidade |
| `state_code` | string | UF com 2 letras |
| `phone` | string | telefone principal |
| `phone_2` | string | telefone adicional |
| `phone_3` | string | telefone adicional |
| `email` | string | e-mail validado |
| `map_url` | string | URL valida http/https |
| `site_url` | string | URL valida http/https |
| `created_at` | string | criacao |
| `updated_at` | string | atualizacao |

### GET /api/technical-assistance

- Acesso: `Publico`
- Resposta `200`: array no shape base
- Ordenacao: `created_at ASC, id ASC`

### POST /api/technical-assistance

- Acesso: `Admin autenticado`
- Body:

| Campo | Tipo | Obrigatorio | Observacao |
| --- | --- | --- | --- |
| `company` | string | Sim | max `255` |
| `address` | string | Sim | max `255` |
| `city` | string | Sim | max `120` |
| `state_code` | string | Sim | UF com 2 letras |
| `phone` | string | Nao | max `40` |
| `phone_2` | string | Nao | max `40` |
| `phone_3` | string | Nao | max `40` |
| `email` | string | Nao | precisa ser valido |
| `map_url` | string | Nao | so `http`/`https` |
| `site_url` | string | Nao | so `http`/`https` |

- Observacao:
  - `uf` tambem pode ser enviado como alias de `state_code`

- Resposta `201`:

```json
{
  "message": "Card de assistencia tecnica criado com sucesso.",
  "item": {}
}
```

### PUT /api/technical-assistance/:id

- Acesso: `Admin autenticado`
- Path params:

| Param | Tipo | Obrigatorio |
| --- | --- | --- |
| `id` | numero | Sim |

- Body: mesmos campos do `POST`
- Resposta `200`:

```json
{
  "message": "Card de assistencia tecnica atualizado com sucesso.",
  "item": {}
}
```

- Erro comum:
  - `404`: card nao encontrado

### DELETE /api/technical-assistance/:id

- Acesso: `Admin autenticado`
- Resposta `200`:

```json
{
  "message": "Card de assistencia tecnica removido com sucesso."
}
```

## 7. Configuracoes de Pagina

Prefixo: `/api/page-settings`

| Metodo | Rota | Acesso | Content-Type | Descricao |
| --- | --- | --- | --- | --- |
| `GET` | `/` | Publico | `application/json` | Lista configuracoes das paginas especiais |
| `PUT` | `/:pageName` | Admin | `multipart/form-data` | Atualiza configuracao de uma pagina especial |

### Paginas validas

- `talmax-digital`
- `upcera`
- `scanners`
- `printers`

### Shape base

| Campo | Tipo | Observacao |
| --- | --- | --- |
| `page_name` | string | chave interna |
| `label` | string | nome exibido |
| `overline` | string | texto superior |
| `title` | string | titulo principal |
| `description` | string | descricao |
| `logo_url` | string | logo |
| `updated_at` | string | data da ultima alteracao |

### GET /api/page-settings

- Acesso: `Publico`
- Resposta `200`: array no shape base
- Observacao:
  - o backend garante linhas padrao quando necessario

### PUT /api/page-settings/:pageName

- Acesso: `Admin autenticado`
- Content-Type: `multipart/form-data`
- Path params:

| Param | Tipo | Obrigatorio | Regra |
| --- | --- | --- | --- |
| `pageName` | string | Sim | deve estar na lista de paginas validas |

- Campos:

| Campo | Tipo | Obrigatorio | Observacao |
| --- | --- | --- | --- |
| `overline` | string | Nao | texto superior |
| `title` | string | Nao | titulo |
| `description` | string | Nao | descricao |
| `logo_url` | string | Nao | usada se nao houver upload |
| `logo` | arquivo | Nao | upload da logo |

- Resposta `200`:

```json
{
  "message": "Configuracao atualizada com sucesso.",
  "item": {
    "page_name": "upcera",
    "label": "Upcera",
    "overline": "",
    "title": "Innovation in Restorative Dentistry",
    "description": "Texto",
    "logo_url": "/img/logo.png"
  }
}
```

- Erro comum:
  - `404`: `pageName` invalido

## 8. Paginas Personalizadas

Prefixo: `/api/custom-pages`

| Metodo | Rota | Acesso | Content-Type | Descricao |
| --- | --- | --- | --- | --- |
| `GET` | `/` | Admin | `application/json` | Lista paginas personalizadas |
| `GET` | `/public/:slug` | Publico | `application/json` | Busca pagina ativa por slug |
| `POST` | `/` | Admin | `multipart/form-data` | Cria pagina personalizada |
| `PUT` | `/:id` | Admin | `multipart/form-data` | Atualiza pagina personalizada |
| `DELETE` | `/:id` | Admin | `application/json` | Exclui pagina personalizada |

### Layouts validos

- `hero-left`
- `hero-centered`
- `hero-split`

### Shape base

| Campo | Tipo | Observacao |
| --- | --- | --- |
| `id` | numero | id da pagina |
| `title` | string | titulo |
| `slug` | string | endereco publico |
| `layout_type` | string | layout escolhido |
| `banner_url` | string or `null` | banner |
| `logo_url` | string or `null` | logo |
| `description` | string | descricao principal |
| `sub_description` | string | descricao secundaria |
| `product_ids` | numero[] | ids vinculados |
| `is_active` | boolean | status |
| `created_at` | string | criacao |
| `updated_at` | string | atualizacao |
| `products` | array | so no endpoint publico ou quando montado explicitamente |

### GET /api/custom-pages

- Acesso: `Admin autenticado`
- Resposta `200`: array no shape base

### GET /api/custom-pages/public/:slug

- Acesso: `Publico`
- Path params:

| Param | Tipo | Obrigatorio |
| --- | --- | --- |
| `slug` | string | Sim |

- Resposta `200`: um item no shape base, com `products` preenchido
- Cada item de `products` retorna:
  - `id`
  - `name`
  - `description`
  - `main_image`
  - `extra_data`

- Erro comum:
  - `404`: pagina nao encontrada ou inativa

### POST /api/custom-pages

- Acesso: `Admin autenticado`
- Content-Type: `multipart/form-data`
- Uploads:
  - `banner`
  - `logo`

- Campos:

| Campo | Tipo | Obrigatorio | Observacao |
| --- | --- | --- | --- |
| `title` | string | Sim | max `160` |
| `slug` | string | Nao | se vazio, nasce do titulo |
| `layout_type` | string | Nao | default `hero-left` |
| `description` | string | Nao | texto |
| `sub_description` | string | Nao | texto |
| `product_ids` | numero[] | Nao | JSON array de ids |
| `is_active` | boolean-like | Nao | default `true` |

- Resposta `201`:

```json
{
  "message": "Pagina criada com sucesso.",
  "item": {}
}
```

- Erros comuns:
  - `400`: titulo ausente ou slug invalido
  - `400`: slug duplicado
  - `503`: tabela indisponivel no banco

### PUT /api/custom-pages/:id

- Acesso: `Admin autenticado`
- Content-Type: `multipart/form-data`
- Path params:

| Param | Tipo | Obrigatorio |
| --- | --- | --- |
| `id` | numero | Sim |

- Campos:

| Campo | Tipo | Obrigatorio | Observacao |
| --- | --- | --- | --- |
| `title` | string | Nao | se omitido, usa atual |
| `slug` | string | Nao | se omitido, usa atual/titulo |
| `layout_type` | string | Nao | `hero-left`, `hero-centered`, `hero-split` |
| `banner_url` | string | Nao | se nao houver upload `banner` |
| `logo_url` | string | Nao | se nao houver upload `logo` |
| `description` | string | Nao | texto |
| `sub_description` | string | Nao | texto |
| `product_ids` | numero[] | Nao | JSON array |
| `is_active` | boolean-like | Nao | default valor atual |
| `banner` | arquivo | Nao | upload |
| `logo` | arquivo | Nao | upload |

- Resposta `200`:

```json
{
  "message": "Pagina atualizada com sucesso.",
  "item": {}
}
```

### DELETE /api/custom-pages/:id

- Acesso: `Admin autenticado`
- Resposta `200`:

```json
{
  "message": "Pagina excluida com sucesso."
}
```

- Erros comuns:
  - `400`: id invalido
  - `404`: pagina nao encontrada

## 9. Grupos Digitais

Prefixo: `/api/digital-groups`

| Metodo | Rota | Acesso | Content-Type | Descricao |
| --- | --- | --- | --- | --- |
| `GET` | `/` | Publico | `application/json` | Lista grupos digitais |
| `GET` | `/public/:slug` | Publico | `application/json` | Busca grupo digital ativo por slug ou id |
| `POST` | `/` | Admin | `multipart/form-data` | Cria grupo digital |
| `PUT` | `/:id` | Admin | `multipart/form-data` | Atualiza grupo digital |
| `DELETE` | `/:id` | Admin | `application/json` | Remove grupo digital |

### Shape base

| Campo | Tipo | Observacao |
| --- | --- | --- |
| `id` | numero | id do grupo |
| `title` | string | titulo |
| `slug` | string | slug publico unico |
| `description` | string | descricao |
| `overline` | string | texto superior |
| `hero_title` | string | titulo de hero |
| `hero_description` | string | descricao de hero |
| `logo_url` | string | logo |
| `display_order` | numero | ordem |
| `is_active` | boolean | status |
| `cards` | array | cards do grupo |

Cada item de `cards` retorna:

| Campo | Tipo | Observacao |
| --- | --- | --- |
| `id` | numero | id do card |
| `custom_page_id` | numero or `null` | pagina vinculada |
| `custom_page_title` | string | titulo da pagina vinculada |
| `title` | string | titulo do card |
| `description` | string | descricao |
| `link_url` | string | URL resolvida |
| `is_external` | boolean | externo ou nao |
| `front_image_url` | string | imagem frontal |
| `back_image_url` | string | imagem traseira |
| `display_order` | numero | ordem |
| `is_active` | boolean | status |

### GET /api/digital-groups

- Acesso: `Publico`
- Query params:

| Param | Tipo | Obrigatorio | Observacao |
| --- | --- | --- | --- |
| `admin` | string | Nao | se `1`, inclui inativos |

- Comportamento:
  - sem `admin=1`, retorna apenas grupos/cards ativos
  - com `admin=1`, retorna tudo

- Resposta `200`: array no shape base

### GET /api/digital-groups/public/:slug

- Acesso: `Publico`
- Path params:

| Param | Tipo | Obrigatorio | Observacao |
| --- | --- | --- | --- |
| `slug` | string | Sim | aceita slug ou id em string |

- Resposta `200`: um item no shape base
- Erro comum:
  - `404`: grupo nao encontrado

### POST /api/digital-groups

- Acesso: `Admin autenticado`
- Content-Type: `multipart/form-data`
- Uploads:
  - `logo`
  - `card_front_<tempId>`
  - `card_back_<tempId>`

- Campos simples:

| Campo | Tipo | Obrigatorio | Observacao |
| --- | --- | --- | --- |
| `title` | string | Nao | titulo do grupo |
| `slug` | string | Nao | se vazio, o backend gera um unico |
| `description` | string | Nao | descricao |
| `overline` | string | Nao | texto superior |
| `hero_title` | string | Nao | titulo hero |
| `hero_description` | string | Nao | descricao hero |
| `logo_url` | string | Nao | usada se nao houver upload |
| `display_order` | numero | Nao | default `0` |
| `is_active` | boolean-like | Nao | default `true` |

- Campo JSON:

| Campo | Tipo | Obrigatorio | Observacao |
| --- | --- | --- | --- |
| `cards` | array | Nao | cards do grupo |

- Estrutura de cada card enviado em `cards`:

```json
[
  {
    "temp_id": "card-1",
    "custom_page_id": 12,
    "title": "Conteudo",
    "description": "Descricao",
    "link_url": "/pagina/exemplo",
    "is_external": false,
    "front_image_url": "/img/frente.png",
    "back_image_url": "/img/verso.png",
    "is_active": true
  }
]
```

- Observacoes:
  - se `custom_page_id` for valido, o backend substitui `link_url` por `/pagina/:slug`
  - `temp_id` e usado para casar uploads `card_front_...` e `card_back_...`

- Resposta `201`:

```json
{
  "message": "Grupo digital criado com sucesso."
}
```

### PUT /api/digital-groups/:id

- Acesso: `Admin autenticado`
- Content-Type: `multipart/form-data`
- Path params:

| Param | Tipo | Obrigatorio |
| --- | --- | --- |
| `id` | numero | Sim |

- Campos e uploads: mesmos do `POST`
- Resposta `200`:

```json
{
  "message": "Grupo digital atualizado com sucesso."
}
```

### DELETE /api/digital-groups/:id

- Acesso: `Admin autenticado`
- Resposta `200`:

```json
{
  "message": "Grupo digital removido com sucesso."
}
```

## 10. Secoes Especiais

Prefixo real: `/api`

Estas rotas atualizam os produtos exibidos nas secoes especiais do site.

| Metodo | Rota | Acesso | Content-Type | Descricao |
| --- | --- | --- | --- | --- |
| `PUT` | `/upcera/products` | Admin | `application/json` | Define produtos da secao Upcera |
| `PUT` | `/scanners/products` | Admin | `application/json` | Define produtos da secao Scanners |
| `PUT` | `/3d-printers/products` | Admin | `application/json` | Define produtos da secao Impressoras 3D |
| `PUT` | `/featured-products` | Admin | `application/json` | Define produtos em destaque |

### Body compartilhado

```json
{
  "selected_products": [
    {
      "id": 10,
      "order": 0,
      "displayMode": "features"
    }
  ]
}
```

### Campos de `selected_products`

| Campo | Tipo | Obrigatorio | Observacao |
| --- | --- | --- | --- |
| `id` | numero | Sim | id do produto |
| `order` | numero | Nao | default `0` |
| `displayMode` | string | Nao | `description`, `features` ou `none` |

### Regras importantes

- `selected_products` nao pode conter ids duplicados
- ids inexistentes geram `400`
- `displayMode` so tem efeito real nas secoes:
  - `upcera`
  - `scanners`
  - `3d-printers`
- em `/featured-products`, o backend usa principalmente `order`

### PUT /api/upcera/products

- Acesso: `Admin autenticado`
- Resposta `200`:

```json
{
  "message": "Produtos Upcera atualizados com sucesso!"
}
```

### PUT /api/scanners/products

- Acesso: `Admin autenticado`
- Resposta `200`:

```json
{
  "message": "Produtos Scanners atualizados com sucesso!"
}
```

### PUT /api/3d-printers/products

- Acesso: `Admin autenticado`
- Resposta `200`:

```json
{
  "message": "Produtos Impressoras 3D atualizados com sucesso!"
}
```

### PUT /api/featured-products

- Acesso: `Admin autenticado`
- Resposta `200`:

```json
{
  "message": "Produtos em destaque atualizados com sucesso!"
}
```

## Resumo final

- Total de endpoints documentados: `47`
- Total de grupos documentados: `10`
- Rotas com upload:
  - `/api/categories`
  - `/api/banners`
  - `/api/products`
  - `/api/home-services`
  - `/api/page-settings`
  - `/api/custom-pages`
  - `/api/digital-groups`
- Rotas master-only:
  - `/api/admin/login-unlock`
  - `/api/admin/users`
  - `/api/admin/users/:id`

## Proximo passo sugerido

Se quiser evoluir essa documentacao depois, os proximos formatos que mais valem a pena sao:

- transformar este arquivo em `Swagger/OpenAPI`
- gerar uma colecao `Postman/Insomnia`
- publicar uma pagina interna com exemplos reais de request/response
teste