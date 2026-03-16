-- ======================================================
-- SCRIPT DE CRIAÇÃO DO BANCO DE DADOS - TALMAX
-- ======================================================

-- 1. Criação do Banco
CREATE DATABASE IF NOT EXISTS `site-talmax`;
USE `site-talmax`;

-- 2. Tabela de Categorias
CREATE TABLE IF NOT EXISTS categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    icon_url VARCHAR(255),
    display_order INT DEFAULT 0,
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2.1 Tabela de Subcategorias
CREATE TABLE IF NOT EXISTS sub_categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    display_order INT DEFAULT 0,
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categorias(id) ON DELETE CASCADE
);

-- 3. Tabela de Produtos
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    main_image VARCHAR(255),
    extra_data JSON, -- Armazena features, models e techInfo
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabelas de Junção (Muitos para Muitos)
CREATE TABLE IF NOT EXISTS product_categorias (
    product_id INT,
    category_id INT,
    PRIMARY KEY (product_id, category_id),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categorias(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS product_sub_categorias (
    product_id INT,
    sub_category_id INT,
    PRIMARY KEY (product_id, sub_category_id),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (sub_category_id) REFERENCES sub_categorias(id) ON DELETE CASCADE
);

-- 5. Tabela de Banners (Opcional)
CREATE TABLE IF NOT EXISTS banners (
    id INT AUTO_INCREMENT PRIMARY KEY,
    image_url VARCHAR(255) NOT NULL,
    title VARCHAR(255),
    link_url VARCHAR(255),
    display_order INT DEFAULT 0,
    active BOOLEAN DEFAULT TRUE
);

-- 6. Tabela de Usuários (Admin)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ======================================================
-- DADOS INICIAIS (SEED)
-- ======================================================

-- Inserindo TODAS as categorias principais com IDs começando em 1
INSERT INTO categorias (id, name, slug, icon_url, display_order, is_visible) VALUES 
(1, 'Gesso e Troquelização', 'gesso-e-troquelizacao', '/img/CAT-icon-gesso.png', 1, 1),
(2, 'Duplicadores', 'duplicadores', '/img/CAT-icon-duplicadores.png', 2, 1),
(3, 'Ceras', 'ceras', '/img/CATicon-ceras.png', 3, 1),
(4, 'Revestimentos', 'revestimentos', '/img/CAT-icon-revestimentos-1.png', 4, 1),
(5, 'Zirkon Ice', 'zirkon-ice', '/img/CAT-icon-zirkon-ice-1.png', 5, 1),
(6, 'Ligas Metálicas', 'ligas-metalicas', '/img/CAT-icon-ligas-metalicas-1.png', 6, 1),
(7, 'Soldas', 'soldas', '/img/CAT-icon-soldas-1.png', 7, 1),
(8, 'Corte e Acabamento', 'corte-e-acabamento', '/img/CAT-icon-acabamentos-1.png', 8, 1),
(9, 'Microscópio e Lupa', 'microscopio-e-lupa', '/img/CAT-icon-microscopio-lupa-1.png', 9, 1),
(10, 'Equipamentos', 'equipamentos', '/img/CAT-icon-equipamentos-1.png', 10, 1),
(11, 'Acessórios para Cerâmica', 'acessorios-para-ceramica', '/img/CAT-icon-ceramica-1.png', 11, 1),
(12, 'T-Lithium', 't-lithium', '/img/CAT.icon-tilithium-1.png', 12, 1),
(13, 'Talmax Digital', 'talmax-digital', NULL, 13, 1),
(14, 'Blocos', 'blocos', NULL, 14, 1),
(15, 'Linha Cad/Cam', 'linha-cad-cam', NULL, 15, 1),
(16, 'Linha de Ceramicas', 'linha-de-ceramicas', NULL, 16, 1),
(17, 'Resinas', 'resinas', NULL, 17, 1);

-- Inserindo Subcategorias atualizadas para apontar para os novos IDs (1-17)
INSERT INTO sub_categorias (id, category_id, name, slug, display_order, is_visible) VALUES 
(1, 3, 'Ceras Galileo', 'ceras-galileo', 1, 1),
(2, 3, 'Ceras Flex', 'ceras-flex', 2, 1),
(3, 3, 'Equipamento para Cera', 'equipamento-para-cera', 3, 1),
(4, 3, 'Utilitários para Cera', 'utilitrios-para-cera', 4, 1),
(5, 8, 'Pedras Ninja - Para Metal', 'pedras-ninja-para-metal', 1, 1),
(6, 8, 'Disco Ninja - Disco e Brocas Diamantada', 'disco-ninja-disco-e-brocas-diamantada', 2, 1),
(7, 8, 'Borrachas Ninja', 'borrachas-ninja', 3, 1),
(8, 8, 'Escovas Ninja', 'escovas-ninja', 4, 1),
(9, 8, 'Utilitário para Corte e Acabamento', 'utilitrio-para-corte-e-acabamento', 5, 1),
(10, 8, 'Pedras Ninja - Para Zircônia', 'pedras-ninja-para-zircnia', 6, 1),
(11, 8, 'Brocas Sinterizadas', 'brocas-sinterizadas', 7, 1),
(12, 10, 'Micromotores', 'micromotores', 1, 1),
(13, 10, 'Fornos', 'fornos', 2, 1),
(14, 10, 'Microscópios - Lupas', 'microscpios-lupas', 3, 1),
(15, 10, 'Fresadoras', 'fresadoras', 4, 1),
(16, 10, 'Ultra-som', 'ultra-som', 5, 1),
(17, 10, 'Aspiradores', 'aspiradores', 6, 1),
(18, 10, 'Poletriz', 'poletriz', 7, 1),
(19, 10, 'Scanners de Mesa', 'scanners-de-mesa', 8, 1),
(20, 15, 'Fit Plus Cera - Aman', 'fit-plus-cera-aman', 1, 1),
(21, 15, 'Fit Plus Cera - Open', 'fit-plus-cera-open', 2, 1),
(22, 15, 'Fit Plus Cera - ZZ', 'fit-plus-cera-zz', 3, 1),
(23, 15, 'Fit Plus ZR - Aman', 'fit-plus-zr-aman', 4, 1),
(24, 15, 'Fit Plus ZR - Open', 'fit-plus-zr-open', 5, 1),
(25, 15, 'Fit Plus ZR - ZZ', 'fit-plus-zr-zz', 6, 1),
(26, 1, 'Gesso Tuff Rock', 'gesso-tuff-rock', 1, 1),
(27, 1, 'Pinos de Troquel', 'pinos-de-troquel', 2, 1),
(28, 1, 'Pinos de Troquel in Box', 'pinos-de-troquel-in-box', 3, 1),
(29, 1, 'Troquelizadores', 'troquelizadores', 4, 1),
(30, 1, 'Articuladores', 'articuladores', 5, 1),
(31, 1, 'Impermeabilizante', 'impermeabilizante', 6, 1),
(32, 1, 'Espaçadores', 'espaadores', 7, 1),
(33, 1, 'Isolante', 'isolante', 8, 1),
(34, 6, 'Blocos e Núcleos - Ligas', 'blocos-e-ncleos-ligas', 1, 1),
(35, 6, 'Metalocerâmica - Ligas', 'metalocermica-ligas', 2, 1),
(36, 6, 'PPR - Ligas', 'ppr-ligas', 3, 1),
(37, 6, 'Utilitários para Ligas (Cadinhos)', 'utilitrios-para-ligas-cadinhos', 4, 1),
(38, 16, 'Pincéis', 'pincis', 1, 1),
(39, 16, 'Godés', 'gods', 2, 1),
(40, 16, 'Bases Refratárias', 'bases-refratrias', 3, 1),
(41, 4, 'Revestimentos - Fundição - Prensagem - Refratários', 'revestimentos-fundio-prensagem-refratrios', 1, 1),
(42, 4, 'Refratários', 'refratrios', 2, 1),
(43, 4, 'Revestimento para Solda', 'revestimento-para-solda', 3, 1),
(44, 4, 'Silicone', 'silicone', 4, 1),
(45, 4, 'Utilitários para Fundição e Prensagem', 'utilitrios-para-fundio-e-prensagem', 5, 1),
(46, 4, 'Micro Fit', 'micro-fit', 6, 1),
(47, 2, 'Duplicador - Fundição - Prensagem - Refratários', 'duplicador-fundio-prensagem-refratrios', 1, 1),
(48, 2, 'Refratários Duplicadores', 'refratrios-duplicadores', 2, 1),
(49, 2, 'Revestimento para Solda Duplicadores', 'revestimento-para-solda-duplicadores', 3, 1),
(50, 2, 'Silicone Duplicadores', 'silicone-duplicadores', 4, 1),
(51, 2, 'Utilitários Duplicadores', 'utilitrios-duplicadores', 5, 1),
(52, 2, 'Micro Fit Duplicadores', 'micro-fit-duplicadores', 6, 1),
(53, 7, 'Metalocerâmica - Soldas', 'metalocermica-soldas', 1, 1),
(54, 7, 'PPR - Soldas', 'ppr-soldas', 2, 1),
(55, 7, 'Utilitários para Soldas', 'utilitrios-para-soldas', 3, 1),
(56, 12, 'Press', 'press', 1, 1),
(57, 12, 'Pad', 'pad', 2, 1),
(58, 12, 'Acessórios T-Lithium', 'acessrios-t-lithium', 3, 1);

-- Criando usuário Admin padrão (Senha: admin123)
INSERT INTO users (username, password, full_name) 
VALUES ('admin', '$2a$10$7vNfN.fBwZ7fVfS.Z7fVfO.7vNfN.fBwZ7fVfS.Z7fVfO', 'Administrador Talmax');
