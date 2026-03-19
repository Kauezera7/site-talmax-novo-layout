# 📄 Documentação Técnica - Site Talmax

Este documento serve como guia rápido para agentes de IA entenderem a arquitetura e as regras de negócio deste projeto.

## 🚀 Visão Geral
O projeto é um catálogo digital de produtos odontológicos, transformado de um site estático para uma aplicação Fullstack dinâmica.

## 🛠 Tech Stack
- **Frontend:** React 19 + Vite 8 (TypeScript/JSX)
- **Estilização:** Vanilla CSS + Framer Motion (animações) + Lucide-React (ícones)
- **Backend:** Node.js + Express
- **Banco de Dados:** MySQL (Local)
- **Upload de Arquivos:** Multer (Imagens salvas em `frontend/public/img`)

## 📂 Estrutura de Pastas
- `/frontend`: Aplicação React.
  - `src/pages/Admin/AdminDashboard.jsx`: Novo painel de controle modular.
  - `src/components/ProductCatalog.jsx`: Listagem dinâmica do banco.
  - `src/components/ProductDetail.jsx`: Detalhes dinâmicos por ID.
  - `src/services/`: Serviços de API (produtos, categorias, banners).
  - `src/hooks/`: Hooks customizados para consumo da API.
- `/backend`: Servidor Node.js.
  - `server.js`: API Express com rotas de Produtos e Categorias.
  - `db.js`: Configuração do Pool de conexão MySQL (mysql2).
  - `.env`: Credenciais do banco (DB_NAME: `site-talmax`).

## 🗄️ Arquitetura do Banco de Dados (MySQL)
O banco principal chama-se `site-talmax`.

### Tabelas Principais:
1. **`categories`**: Armazena as categorias (Gesso, Ceras, etc).
2. **`products`**: Armazena os produtos.
   - **Campo Chave:** `extra_data` (Tipo JSON). 
   - **Finalidade:** Armazena de forma flexível as `features[]`, `models[]` (type/code) e `techInfo{}`. Isso evita múltiplas colunas nulas.

## 🔌 API Endpoints (Porta 5000)
- `GET /api/categories`: Lista todas as categorias.
- `GET /api/products`: Lista todos os produtos (com JOIN na categoria).
- `GET /api/products/:id`: Detalhes de um produto específico.
- `POST /api/products`: Cria novo produto (Multipart/form-data para imagem).
- `PUT /api/products/:id`: Edita produto existente.
- `DELETE /api/products/:id`: Remove produto do banco.

## ⚠️ Observações Importantes para IA
1. **Fluxo de Imagens:** As imagens são enviadas pelo Admin, processadas pelo Multer e salvas diretamente em `frontend/public/img`. O caminho salvo no banco é sempre `/img/nome-do-arquivo.webp`.
2. **Sincronização:** O catálogo (`ProductCatalog`) e a página de detalhes (`ProductDetail`) realizam `fetch` para o backend no `useEffect`.
3. **Filtros:** A filtragem por categorias no frontend usa o `slug` da categoria vindo do banco.

## 🛠 Como Rodar
1. **Backend:** `cd backend && node server.js`
2. **Frontend:** `cd frontend && npm run dev`
3. **Banco:** Certifique-se que o MySQL está rodando (XAMPP/WAMP).
