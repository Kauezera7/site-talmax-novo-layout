-- ======================================================
-- SCRIPT DE CRIAÇÃO DO BANCO DE DADOS - TALMAX
-- ======================================================

-- 1. Criação do Banco
CREATE DATABASE IF NOT EXISTS talmax_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE talmax_db;

-- 2. Tabela de Categorias
-- Armazena os grupos de produtos com seus ícones
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    icon_url VARCHAR(255),
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabela de Produtos
-- Armazena os dados principais e dados flexíveis em JSON
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    main_image VARCHAR(255), -- Imagem principal exibida no card
    -- O campo extra_data salvará: features[], models[], techInfo{}, images[]
    extra_data JSON, 
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE, -- Para destacar na Home
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- 4. Tabela de Usuários (Administradores)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabela de Banners (Extra!)
-- Para você gerenciar o HeroSlider via Admin
CREATE TABLE IF NOT EXISTS banners (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    subtitle VARCHAR(255),
    image_url VARCHAR(255) NOT NULL,
    link_url VARCHAR(255),
    display_order INT DEFAULT 0,
    active BOOLEAN DEFAULT TRUE
);

-- ======================================================
-- DADOS INICIAIS (SEED)
-- ======================================================

-- Inserindo TODAS as categorias do seu projeto atual
INSERT INTO categories (name, slug, icon_url, display_order) VALUES 
('Gesso e Troquelização', 'gesso-e-troquelizacao', '/img/CAT-icon-gesso.png', 1),
('Duplicadores', 'duplicadores', '/img/CAT-icon-duplicadores.png', 2),
('Ceras', 'ceras', '/img/CATicon-ceras.png', 3),
('Revestimentos', 'revestimentos', '/img/CAT-icon-revestimentos-1.png', 4),
('Zirkon Ice', 'zirkon-ice', '/img/CAT-icon-zirkon-ice-1.png', 5),
('Ligas Metálicas', 'ligas-metalicas', '/img/CAT-icon-ligas-metalicas-1.png', 6),
('Soldas', 'soldas', '/img/CAT-icon-soldas-1.png', 7),
('Corte e Acabamento', 'corte-e-acabamento', '/img/CAT-icon-acabamentos-1.png', 8),
('Microscópio e Lupa', 'microscopio-e-lupa', '/img/CAT-icon-microscopio-lupa-1.png', 9),
('Equipamentos', 'equipamentos', '/img/CAT-icon-equipamentos-1.png', 10),
('Acessórios para Cerâmica', 'acessorios-para-ceramica', '/img/CAT-icon-ceramica-1.png', 11),
('T-Lithium', 't-lithium', '/img/CAT.icon-tilithium-1.png', 12),
('Talmax Digital', 'talmax-digital', NULL, 13);

-- Criando usuário Admin padrão (Senha: admin123)
-- Hash gerado com bcrypt
INSERT INTO users (username, password, full_name) 
VALUES ('admin', '$2a$10$7vNfN.fBwZ7fVfS.Z7fVfO.7vNfN.fBwZ7fVfS.Z7fVfO', 'Administrador Talmax');
