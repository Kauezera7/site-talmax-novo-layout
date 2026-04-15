# Lista Completa de Testes — site-talmax

Total estimado: **~200 testes** divididos em 4 fases.

---

## 🟢 FASE 1 — Testes Unitários (Funções Puras) — COMEÇAR AQUI

São os mais fáceis: não precisam de banco, API ou navegador.

### Backend — Utils

| # | Arquivo | Função | O que testar |
|---|---------|--------|--------------|
| 1 | `utils/common.js` | `safe(value)` | Retorna null para undefined, mantém outros valores |
| 2 | `utils/requestParsers.js` | `parseBooleanFlag(value)` | true/false/1/0/"true"/"sim"/"yes" → boolean |
| 3 | `utils/requestParsers.js` | `parseInteger(value, fallback)` | Strings numéricas, NaN retorna fallback |
| 4 | `utils/requestParsers.js` | `parseJsonObject(value, fallback)` | JSON válido/inválido, retorna fallback |
| 5 | `utils/requestParsers.js` | `parseIdArray(value)` | String/JSON/number → array de IDs únicos |
| 6 | `utils/requestParsers.js` | `parseStringArray(value)` | String/JSON/array → array de strings únicas |
| 7 | `utils/requestParsers.js` | `getUploadedImagePaths(files)` | Gera caminhos `/img/filename` dos arquivos |
| 8 | `utils/inputSanitization.js` | `normalizeTextValue(value)` | Normaliza CRLF, valores null/undefined |
| 9 | `utils/inputSanitization.js` | `sanitizeTextInput(value, opts)` | Remove `<script>`, HTML, caracteres de controle |
| 10 | `utils/inputSanitization.js` | `sanitizeUrlLikeValue(value)` | Sanitiza URLs, remove espaços |
| 11 | `utils/inputSanitization.js` | `sanitizeNavigationTarget(value, opts)` | Bloqueia `javascript:`, `data:`, permite URLs válidas |
| 12 | `utils/inputSanitization.js` | `sanitizeAssetReference(value, opts)` | Valida referências de assets, Cloudinary |
| 13 | `utils/errorHandling.js` | `normalizeStatusCode(value)` | Status 400-599 válidos, fallback para 500 |
| 14 | `utils/errorHandling.js` | `HttpError` (classe) | Construtor com statusCode, publicMessage, expose |
| 15 | `utils/errorHandling.js` | `createHttpError(status, msg, opts)` | Factory cria HttpError corretamente |
| 16 | `utils/errorHandling.js` | `normalizeUploadError(error)` | Converte erros do Multer (LIMIT_FILE_SIZE etc.) |
| 17 | `utils/errorHandling.js` | `normalizeValidationError(error)` | Converte erros de validação → HttpError |
| 18 | `utils/errorHandling.js` | `normalizeError(error)` | Normaliza qualquer tipo de erro |
| 19 | `utils/errorHandling.js` | `wrapError(error, opts)` | Re-wraps erro com contexto adicional |
| 20 | `utils/errorHandling.js` | `summarizeFile(file)` | Extrai campos-chave do objeto file |
| 21 | `utils/errorHandling.js` | `extractRequestContext(req)` | Monta contexto do request para log |

### Backend — Validação (Zod Schemas)

| # | Arquivo | Função/Schema | O que testar |
|---|---------|---------------|--------------|
| 22 | `validation/requestValidation.js` | `buildPathLabel(path)` | Converte array de path para notação com ponto |
| 23 | `validation/requestValidation.js` | `formatZodIssues(issues)` | Formata erros do Zod para formato da API |
| 24 | `validation/requestValidation.js` | `validateWithSchema(schema, payload)` | Valida payload, lança erro se inválido |
| 25 | `validation/requestValidation.js` | `parseJsonField(value, schema)` | Parse JSON + validação |
| 26 | `validation/requestValidation.js` | `coerceTrimmedString(value)` | Trimma e sanitiza string |
| 27 | `validation/requestValidation.js` | `booleanLike(label)` | Schema aceita true/false/1/0/"sim" |
| 28 | `validation/requestValidation.js` | `integerLike(label)` | Schema aceita string numérica |
| 29 | `validation/adminUserSchemas.js` | `createAdminUserSchema` | Aceita dados válidos, rejeita inválidos |
| 30 | `validation/adminUserSchemas.js` | `updateAdminUserSchema` | Campos opcionais, senha opcional |
| 31 | `validation/adminUserSchemas.js` | `requiredUsername` | 3-50 chars, alfanumérico + _ - . |
| 32 | `validation/adminUserSchemas.js` | `requiredPassword` | 6-100 chars |
| 33 | `validation/adminUserSchemas.js` | `requiredEmail` | Email válido, lowercase |
| 34 | `validation/contentSchemas.js` | `validateCategoryWritePayload()` | Valida create/update de categoria |
| 35 | `validation/contentSchemas.js` | `validateBannerWritePayload()` | Valida create/update de banner |
| 36 | `validation/productSchemas.js` | `sanitizeTextValue(value, opts)` | Sanitiza texto com opção newline |
| 37 | `validation/productSchemas.js` | `hasMeaningfulModelTable()` | Detecta tabela de modelos vazia vs. com dados |
| 38 | `validation/productSchemas.js` | `buildLegacyModelTableFromModels()` | Converte formato legado para novo |
| 39 | `validation/productSchemas.js` | `normalizeModelTableConfigList()` | Merge tabelas novas e legado |
| 40 | `validation/productSchemas.js` | `normalizeProductExtraDataForStorage()` | Prepara extra_data para salvar no banco |
| 41 | `validation/productSchemas.js` | `normalizeStoredProductExtraData()` | Lê extra_data do banco e normaliza |
| 42 | `validation/productSchemas.js` | `validateProductWritePayload()` | Valida criação/edição de produto |
| 43 | `validation/productSchemas.js` | `parseProductWriteRequest(body)` | Parse multipart form → payload |
| 44 | `validation/productSchemas.js` | `productExtraDataInputSchema` | Valida tabs, features, specs, modelTables |

### Backend — Auth (funções puras)

| # | Arquivo | Função | O que testar |
|---|---------|--------|--------------|
| 45 | `auth/adminSession.js` | `safeEqual(a, b)` | Comparação timing-safe, strings iguais/diferentes |
| 46 | `auth/adminSession.js` | `hashAdminPassword(password)` | Gera hash scrypt com salt aleatório |
| 47 | `auth/adminSession.js` | `verifyAdminPassword(plain, stored)` | Verifica password correto/incorreto |
| 48 | `auth/adminSession.js` | `normalizeAdminRole(value)` | Normaliza para 'master' ou 'editor' |
| 49 | `auth/adminSession.js` | `parseCookies(req)` | Parse header de cookies |
| 50 | `auth/adminSession.js` | `base64UrlEncode(value)` | Encode base64url |
| 51 | `auth/adminSession.js` | `base64UrlDecode(value)` | Decode base64url |
| 52 | `auth/adminSession.js` | `createJwtToken(payload)` | Cria JWT HS256 válido |
| 53 | `auth/adminSession.js` | `verifyJwtToken(token)` | Verifica assinatura, detecta expirado |
| 54 | `auth/adminSession.js` | `getAdminCookieOptions()` | Retorna httpOnly, secure, sameSite |
| 55 | `auth/adminSession.js` | `serializeAdminUser(user)` | Formata objeto user para resposta da API |

### Backend — Segurança

| # | Arquivo | Função | O que testar |
|---|---------|--------|--------------|
| 56 | `seguranca/adminLoginRateLimit.js` | `parsePositiveInteger(value, fallback)` | Parse env var para inteiro positivo |
| 57 | `seguranca/adminLoginRateLimit.js` | `normalizeAdminUsername(value)` | trim + lowercase |
| 58 | `seguranca/adminLoginRateLimit.js` | `getAdminLoginRateLimitKeyForUsername()` | Gera chave de rate limit por username |
| 59 | `seguranca/adminLoginRateLimit.js` | `getAdminLoginRateLimitKeyForIp()` | Gera chave de rate limit por IP |
| 60 | `seguranca/adminLoginRateLimit.js` | `getRetryAfterSecondsFromResetTime()` | Calcula tempo de espera em segundos |
| 61 | `seguranca/trustProxy.js` | `parseTrustProxySetting(value)` | Parse true/false/number/lista de IPs |

### Backend — Services (funções puras)

| # | Arquivo | Função | O que testar |
|---|---------|--------|--------------|
| 62 | `services/fileStorageService.js` | `hasCloudinaryConfig()` | Detecta env vars do Cloudinary |
| 63 | `services/fileStorageService.js` | `hasSftpConfig()` | Detecta env vars do SFTP |
| 64 | `services/fileStorageService.js` | `buildLocalImageUrl(file)` | Gera URL `/img/filename` |
| 65 | `services/fileStorageService.js` | `buildRemoteImageUrl(fileName)` | Gera URL SFTP pública |
| 66 | `services/fileStorageService.js` | `buildCloudinaryFolder(type)` | Gera path de pasta Cloudinary |
| 67 | `services/productService.js` | `normalizeProductTabRow(row)` | Formata tab do banco |
| 68 | `services/productService.js` | `normalizeIncomingTabs(tabs)` | Sanitiza tabs de entrada |
| 69 | `services/productService.js` | `formatProductRow(row)` | Formata produto completo do banco |
| 70 | `services/productService.js` | `normalizeTextSearch(value)` | Normaliza busca (trim, lowercase) |
| 71 | `services/productService.js` | `normalizeSlugList(value)` | Normaliza array de slugs de categoria |
| 72 | `services/productService.js` | `buildProductListWhereClause(opts)` | Monta WHERE clause para filtro |
| 73 | `services/backupContentService.js` | `normalizeExtraData(value)` | Normaliza extra_data do backup |
| 74 | `services/backupContentService.js` | `buildProductLookups()` | Cria maps de lookup de categorias |

### Frontend — Utils

| # | Arquivo | Função | O que testar |
|---|---------|--------|--------------|
| 75 | `utils/searchText.js` | `normalizeSearchText(value)` | Lowercase, remove acentos, trim |
| 76 | `utils/productCategories.js` | `getVisibleCategoryLabel(names, hidden)` | Filtra categorias ocultas, fallback "Sem categoria" |
| 77 | `utils/productCategories.js` | `getNormalizedCategoryNames(names)` | Normaliza string ou array de categorias |
| 78 | `utils/contentSafety.js` | `sanitizeTextInput(value, opts)` | Remove HTML perigoso, preserva newlines |
| 79 | `utils/contentSafety.js` | `sanitizeNavigationTarget(value, opts)` | Bloqueia javascript:/data:, permite URLs válidas |
| 80 | `utils/contentSafety.js` | `isExternalNavigationTarget(value)` | Detecta http/https/mailto/tel |
| 81 | `utils/contentSafety.js` | `sanitizeAssetReference(value, opts)` | Valida referências de assets |
| 82 | `utils/contentSafety.js` | `parseSafeExtraData(value)` | Parse/sanitiza extra_data de produto |
| 83 | `utils/assets.js` | `assetPath(path)` | Converte path relativo para caminho completo |
| 84 | `utils/assets.js` | `apiAssetPath(path)` | Converte path da API para URL completa |
| 85 | `utils/assets.js` | `resolveStoredAssetPath(path)` | Resolve path de asset armazenado |

### Frontend — Services (funções puras)

| # | Arquivo | Função | O que testar |
|---|---------|--------|--------------|
| 86 | `services/adminRequest.js` | `createAdminRequestOptions(opts)` | Monta headers com token de auth |
| 87 | `services/adminRequest.js` | `ensureAdminResponse(response, msg)` | Valida response, limpa token se 401 |
| 88 | `services/adminSessionStorage.js` | `readStoredAdminSessionToken()` | Lê token do sessionStorage |
| 89 | `services/adminSessionStorage.js` | `storeAdminSessionToken(token)` | Grava token no sessionStorage |
| 90 | `services/adminSessionStorage.js` | `clearStoredAdminSessionToken()` | Limpa token do sessionStorage |
| 91 | `services/adminSessionEvents.js` | `dispatchAdminSessionExpired()` | Dispara evento customizado |
| 92 | `services/adminSessionEvents.js` | `subscribeToAdminSessionExpired(cb)` | Inscreve e retorna unsubscribe |
| 93 | `services/pageSettingsService.js` | `normalizeSpecialPageSettings(items)` | Merge settings com defaults |

---

## 🟡 FASE 2 — Testes de Integração (Rotas da API)

Precisam do banco rodando (ou mockado). Testam a API de fora pra dentro.

### Rotas de Admin Auth

| # | Rota | Método | O que testar |
|---|------|--------|--------------|
| 94 | `/api/admin/login` | POST | Login com credenciais corretas → 200 + token |
| 95 | `/api/admin/login` | POST | Login com senha errada → 401 |
| 96 | `/api/admin/login` | POST | Login bloqueado por rate limit → 429 |
| 97 | `/api/admin/session` | GET | Com token válido → 200 + dados do user |
| 98 | `/api/admin/session` | GET | Sem token → 401 |
| 99 | `/api/admin/session` | GET | Com token expirado → 401 |
| 100 | `/api/admin/logout` | POST | Limpa cookie → 200 |
| 101 | `/api/admin/users` | GET | Sem ser master → 403 |
| 102 | `/api/admin/users` | POST | Cria user válido → 201 |
| 103 | `/api/admin/users/:id` | PUT | Atualiza user → 200 |

### Rotas de Produtos

| # | Rota | Método | O que testar |
|---|------|--------|--------------|
| 104 | `/api/products` | GET | Retorna lista de produtos ativos |
| 105 | `/api/products` | GET | Paginação funciona (page, limit) |
| 106 | `/api/products` | GET | Filtro por categoria funciona |
| 107 | `/api/products` | GET | Busca por texto funciona |
| 108 | `/api/products/:id` | GET | Retorna produto por ID → 200 |
| 109 | `/api/products/:id` | GET | ID inexistente → 404 |
| 110 | `/api/products` | POST | Cria produto com imagens (admin) → 201 |
| 111 | `/api/products` | POST | Sem autenticação → 401 |
| 112 | `/api/products` | POST | Dados inválidos → 400 |
| 113 | `/api/products` | POST | Nome duplicado → 409 |
| 114 | `/api/products/:id` | PUT | Atualiza produto (admin) → 200 |
| 115 | `/api/products/:id` | DELETE | Deleta produto (admin) → 200 |
| 116 | `/api/products/:id/active` | PATCH | Toggle ativo/inativo → 200 |

### Rotas de Categorias

| # | Rota | Método | O que testar |
|---|------|--------|--------------|
| 117 | `/api/categories` | GET | Retorna lista de categorias |
| 118 | `/api/categories/:id` | GET | Retorna categoria por ID |
| 119 | `/api/categories` | POST | Cria categoria (admin) → 201 |
| 120 | `/api/categories/:id` | PUT | Atualiza categoria (admin) → 200 |
| 121 | `/api/categories/:id` | DELETE | Deleta categoria (admin) → 200 |

### Rotas de Banners

| # | Rota | Método | O que testar |
|---|------|--------|--------------|
| 122 | `/api/banners` | GET | Retorna lista de banners |
| 123 | `/api/banners` | POST | Cria banner (admin) → 201 |
| 124 | `/api/banners/:id` | PUT | Atualiza banner (admin) → 200 |
| 125 | `/api/banners/:id` | DELETE | Deleta banner (admin) → 200 |

### Rotas de Serviços da Home

| # | Rota | Método | O que testar |
|---|------|--------|--------------|
| 126 | `/api/home-services` | GET | Retorna serviços ativos |
| 127 | `/api/home-services` | POST | Cria serviço (admin) → 201 |
| 128 | `/api/home-services/:id` | PUT | Atualiza serviço (admin) → 200 |
| 129 | `/api/home-services/:id` | DELETE | Deleta serviço (admin) → 200 |

### Outras Rotas

| # | Rota | Método | O que testar |
|---|------|--------|--------------|
| 130 | `/api/page-settings` | GET | Retorna configurações de páginas especiais |
| 131 | `/api/page-settings/:page` | PUT | Atualiza configuração (admin) |
| 132 | `/api/custom-pages` | GET | Lista páginas customizadas |
| 133 | `/api/custom-pages/:slug` | GET | Busca página por slug |
| 134 | `/api/custom-pages` | POST | Cria página (admin) |
| 135 | `/api/custom-pages/:id` | PUT | Atualiza página (admin) |
| 136 | `/api/custom-pages/:id` | DELETE | Deleta página (admin) |
| 137 | `/api/digital-groups` | GET | Lista grupos digitais |
| 138 | `/api/digital-groups` | POST | Cria grupo (admin) |
| 139 | `/api/upcera/products` | GET | Produtos da seção Upcera |
| 140 | `/api/scanners/products` | GET | Produtos da seção Scanners |
| 141 | `/api/3d-printers/products` | GET | Produtos da seção Impressoras 3D |
| 142 | `/api/featured-products` | GET | Produtos em destaque |

### Middleware

| # | Middleware | O que testar |
|---|-----------|--------------|
| 143 | `requireAdminSession` | Sem token → 401, token inválido → 401, token válido → next() |
| 144 | `requireMasterAdminSession` | Role editor → 403, role master → next() |
| 145 | `errorHandler` | Erros 500 em prod escondem detalhes, em dev mostram |
| 146 | `attachRequestId` | Gera X-Request-Id no header |
| 147 | `apiNotFoundHandler` | Rotas inexistentes → 404 |
| 148 | `adminLoginRateLimit` | Bloqueia após 5 tentativas |

---

## 🔵 FASE 3 — Testes de Componente (Frontend)

Testam se os componentes React renderizam corretamente.

### Componentes Reutilizáveis

| # | Componente | O que testar |
|---|-----------|--------------|
| 149 | `ProductCard` | Renderiza nome, imagem, link do produto |
| 150 | `ProductCard` | Sem imagem → mostra fallback |
| 151 | `ProductCard` | Clique navega para detalhe do produto |
| 152 | `HeroSlider` | Renderiza banners no carrossel |
| 153 | `HeroSlider` | Sem banners → não quebra |
| 154 | `CookieBanner` | Aparece na primeira visita |
| 155 | `CookieBanner` | Aceitar → some e salva no storage |
| 156 | `PagePlaceholder` | Renderiza skeleton de loading |

### Páginas Públicas

| # | Componente | O que testar |
|---|-----------|--------------|
| 157 | `Home` | Renderiza seções (serviços, destaques, categorias) |
| 158 | `HomeServicesSection` | Renderiza lista de serviços |
| 159 | `HomeFeaturedProductsSection` | Renderiza carrossel de destaques |
| 160 | `HomeCategoriesSection` | Renderiza grid de categorias |
| 161 | `ProductCatalog` | Renderiza lista com paginação |
| 162 | `ProductCatalog` | Filtro por categoria funciona |
| 163 | `ProductCatalog` | Busca por texto funciona |
| 164 | `ProductDetail` | Renderiza galeria, descrição, specs |
| 165 | `ProductDetail` | Produto não encontrado → mensagem de erro |
| 166 | `QuemSomos` | Renderiza página "Quem Somos" |
| 167 | `PrivacyPolicy` | Renderiza política de privacidade |
| 168 | `Support` | Renderiza página de suporte |
| 169 | `CustomPage` | Renderiza página customizada por slug |
| 170 | `TalmaxDigital` | Renderiza página Talmax Digital |
| 171 | `Upcera` | Renderiza página Upcera com produtos |
| 172 | `Scanners` | Renderiza página Scanners com produtos |
| 173 | `Impressoras3D` | Renderiza página Impressoras 3D |

### Páginas Admin

| # | Componente | O que testar |
|---|-----------|--------------|
| 174 | `AdminLogin` | Renderiza formulário de login |
| 175 | `AdminLogin` | Submete credenciais, mostra erro se inválido |
| 176 | `AdminDashboard` | Renderiza menu lateral e conteúdo |
| 177 | `AdminProducts / ProductTable` | Lista produtos com ações |
| 178 | `ProductForm` | Formulário de criação preenche campos |
| 179 | `ProductForm` | Validação de campos obrigatórios |
| 180 | `AdminCategories / CategoryTable` | Lista categorias |
| 181 | `CategoryForm` | Formulário de categoria |
| 182 | `AdminBanners / BannerTable` | Lista banners |
| 183 | `BannerForm` | Formulário de banner |
| 184 | `AdminSegments / SegmentTable` | Lista segmentos |
| 185 | `SpecialSectionManager` | Seletor de produtos para seções especiais |
| 186 | `AdminUsers` | Lista e gerencia usuários admin |

---

## 🟣 FASE 4 — Testes de Hooks e Context

| # | Hook/Context | O que testar |
|---|-------------|--------------|
| 187 | `useProducts` | Fetch inicial carrega produtos |
| 188 | `useProducts` | `createProduct()` adiciona à lista |
| 189 | `useProducts` | `deleteProduct()` remove da lista |
| 190 | `useProducts` | `updateProductActiveStatus()` faz update otimista + rollback |
| 191 | `useCategories` | Fetch separa main e sub categorias |
| 192 | `useCategories` | `createCategory()` adiciona à lista |
| 193 | `useCategories` | `deleteCategory()` remove da lista |
| 194 | `useBanners` | Fetch carrega banners |
| 195 | `useBanners` | CRUD funciona corretamente |
| 196 | `useDeferredSection` | `shouldLoad` começa false |
| 197 | `useDeferredSection` | `shouldLoad` vira true quando visível |
| 198 | `AdminContext / useAdmin` | Provê dados de todos os hooks |
| 199 | `useAdmin` | Fora do Provider → lança erro |
| 200 | `useAdmin` | `refreshAll()` atualiza tudo |

---

## 📦 Ferramentas Necessárias

### Backend (Jest + Supertest)
```bash
cd backend
npm install --save-dev jest supertest
```

Adicionar no `package.json`:
```json
"scripts": {
  "test": "jest --verbose",
  "test:watch": "jest --watch"
}
```

### Frontend (Vitest + Testing Library)
```bash
cd frontend
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

Adicionar no `vite.config.js`:
```js
test: {
  environment: 'jsdom',
  globals: true,
  setupFiles: './src/test/setup.js'
}
```

---

## 🎯 Ordem de Prioridade

1. **Fase 1 primeiro** — dá resultado rápido, cobre as funções mais críticas
2. **Fase 2 depois** — garante que a API funciona de ponta a ponta
3. **Fase 3 e 4** — melhoram confiança nas mudanças do frontend
