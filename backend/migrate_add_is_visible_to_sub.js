const db = require('./db');

async function migrate() {
    try {
        console.log('--- Iniciando Migração: Adicionando is_visible em sub_categorias ---');

        const [columns] = await db.query("SHOW COLUMNS FROM sub_categorias LIKE 'is_visible'");
        if (columns.length === 0) {
            await db.query("ALTER TABLE sub_categorias ADD COLUMN is_visible BOOLEAN DEFAULT TRUE AFTER display_order");
            console.log('✓ Coluna is_visible adicionada à tabela sub_categorias.');
        } else {
            console.log('! Coluna is_visible já existe na tabela sub_categorias.');
        }

        console.log('--- Migração Concluída com Sucesso! ---');
        process.exit(0);
    } catch (error) {
        console.error('X Falha na migração:', error);
        process.exit(1);
    }
}

migrate();
