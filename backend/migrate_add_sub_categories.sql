-- SQL Migration to add sub_categories table
USE `site-talmax`;

-- 1. Create sub_categories table
CREATE TABLE IF NOT EXISTS sub_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- 2. Add sub_category_id to products table
-- We'll add it as nullable first to avoid breaking existing data
ALTER TABLE products ADD COLUMN IF NOT EXISTS sub_category_id INT AFTER category_id;

-- 3. Add foreign key constraint for products -> sub_categories
-- We wrap this in a check to see if it already exists, but for standard SQL scripts, we just run it.
-- Note: MySQL 8+ supports ALTER TABLE ADD CONSTRAINT IF NOT EXISTS, but we'll use a safer approach.
ALTER TABLE products 
ADD CONSTRAINT fk_products_sub_category 
FOREIGN KEY (sub_category_id) REFERENCES sub_categories(id) 
ON DELETE SET NULL;
