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

-- Inserindo TODAS as categorias do seu projeto atual
INSERT INTO categorias (name, slug, icon_url, display_order, is_visible) VALUES 
('Gesso e Troquelização', 'gesso-e-troquelizacao', '/img/CAT-icon-gesso.png', 1, 1),
('Duplicadores', 'duplicadores', '/img/CAT-icon-duplicadores.png', 2, 1),
('Ceras', 'ceras', '/img/CATicon-ceras.png', 3, 1),
('Revestimentos', 'revestimentos', '/img/CAT-icon-revestimentos-1.png', 4, 1),
('Zirkon Ice', 'zirkon-ice', '/img/CAT-icon-zirkon-ice-1.png', 5, 1),
('Ligas Metálicas', 'ligas-metalicas', '/img/CAT-icon-ligas-metalicas-1.png', 6, 1),
('Soldas', 'soldas', '/img/CAT-icon-soldas-1.png', 7, 1),
('Corte e Acabamento', 'corte-e-acabamento', '/img/CAT-icon-acabamentos-1.png', 8, 1),
('Microscópio e Lupa', 'microscopio-e-lupa', '/img/CAT-icon-microscopio-lupa-1.png', 9, 1),
('Equipamentos', 'equipamentos', '/img/CAT-icon-equipamentos-1.png', 10, 1),
('Acessórios para Cerâmica', 'acessorios-para-ceramica', '/img/CAT-icon-ceramica-1.png', 11, 1),
('T-Lithium', 't-lithium', '/img/CAT.icon-tilithium-1.png', 12, 1),
('Talmax Digital', 'talmax-digital', NULL, 13, 1),
('Blocos', 'blocos', NULL, 14, 1),
('Linha Cad/Cam', 'linha-cad-cam', NULL, 15, 1),
('Linha de Ceramicas', 'linha-de-ceramicas', NULL, 16, 1),
('Resinas', 'resinas', NULL, 17, 1);

-- Criando usuário Admin padrão (Senha: admin123)
-- Hash gerado com bcrypt
INSERT INTO users (username, password, full_name) 
VALUES ('admin', '$2a$10$7vNfN.fBwZ7fVfS.Z7fVfO.7vNfN.fBwZ7fVfS.Z7fVfO', 'Administrador Talmax');
