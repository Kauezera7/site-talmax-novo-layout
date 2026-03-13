const db = require('./db');

async function migrate() {
    try {
        console.log('--- Iniciando Migração: Criando sub_categorias ---');

        // 1. Criar tabela sub_categorias
        await db.query(`
            CREATE TABLE IF NOT EXISTS sub_categorias (
                id INT AUTO_INCREMENT PRIMARY KEY,
                category_id INT NOT NULL,
                name VARCHAR(100) NOT NULL,
                slug VARCHAR(100) NOT NULL UNIQUE,
                display_order INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (category_id) REFERENCES categorias(id) ON DELETE CASCADE
            )
        `);
        console.log('✓ Tabela sub_categorias criada (ou já existe).');

        // 2. Adicionar coluna sub_category_id à tabela products se ela não existir
        const [columns] = await db.query("SHOW COLUMNS FROM products LIKE 'sub_category_id'");
        if (columns.length === 0) {
            await db.query("ALTER TABLE products ADD COLUMN sub_category_id INT AFTER category_id");
            console.log('✓ Coluna sub_category_id adicionada à tabela products.');

            // Adicionar a restrição de chave estrangeira apenas se a coluna foi recém-criada
            try {
                await db.query(`
                    ALTER TABLE products 
                    ADD CONSTRAINT fk_products_sub_category 
                    FOREIGN KEY (sub_category_id) REFERENCES sub_categorias(id) 
                    ON DELETE SET NULL
                `);
                console.log('✓ Chave estrangeira fk_products_sub_category adicionada.');
            } catch (fkError) {
                console.warn('! Erro ao adicionar chave estrangeira (pode já existir):', fkError.message);
            }
        } else {
            console.log('! Coluna sub_category_id já existe na tabela products.');
        }

        console.log('--- Migração Concluída com Sucesso! ---');
        process.exit(0);
    } catch (error) {
        console.error('X Falha na migração:', error);
        process.exit(1);
    }
}

migrate();
