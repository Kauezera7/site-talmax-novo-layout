-- Script para converter categoria única em múltiplas categorias

USE talmax_db;

-- 1. Criar a tabela de junção
CREATE TABLE IF NOT EXISTS product_categories (
    product_id INT,
    category_id INT,
    PRIMARY KEY (product_id, category_id),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- 2. Migrar os dados existentes da tabela products para a nova tabela
INSERT INTO product_categories (product_id, category_id)
SELECT id, category_id FROM products WHERE category_id IS NOT NULL;

-- 3. Remover a coluna antiga (Opcional, mas recomendado para manter o banco limpo)
-- ALTER TABLE products DROP FOREIGN KEY products_ibfk_1; -- Nome da FK pode variar
-- ALTER TABLE products DROP COLUMN category_id;

-- Nota: Se você estiver usando o MySQL Workbench ou similar, pode rodar este script.
-- Vou aplicar a lógica no backend para que ele funcione mesmo se a coluna ainda existir.
