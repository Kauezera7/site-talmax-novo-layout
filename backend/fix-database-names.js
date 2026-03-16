const db = require('./db');

async function fixSchema() {
    try {
        console.log('--- Iniciando Correção de Schema ---');

        // 1. Verificar se a tabela 'categories' existe e a 'categorias' não
        const [tables] = await db.query('SHOW TABLES');
        const tableNames = tables.map(t => Object.values(t)[0]);
        console.log('Tabelas encontradas:', tableNames);

        if (tableNames.includes('categories') && !tableNames.includes('categorias')) {
            console.log('Renomeando categories -> categorias');
            await db.query('RENAME TABLE categories TO categorias');
        }

        if (tableNames.includes('product_categories') && !tableNames.includes('product_categorias')) {
            console.log('Renomeando product_categories -> product_categorias');
            await db.query('RENAME TABLE product_categories TO product_categorias');
        }

        if (tableNames.includes('sub_categories') && !tableNames.includes('sub_categorias')) {
            console.log('Renomeando sub_categories -> sub_categorias');
            await db.query('RENAME TABLE sub_categories TO sub_categorias');
        }

        // 2. Garantir que as tabelas de junção existem com os nomes certos (conforme server.js)
        await db.query(`
            CREATE TABLE IF NOT EXISTS product_categorias (
                product_id INT,
                category_id INT,
                PRIMARY KEY (product_id, category_id),
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
                FOREIGN KEY (category_id) REFERENCES categorias(id) ON DELETE CASCADE
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS product_sub_categorias (
                product_id INT,
                sub_category_id INT,
                PRIMARY KEY (product_id, sub_category_id),
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
                FOREIGN KEY (sub_category_id) REFERENCES sub_categorias(id) ON DELETE CASCADE
            )
        `);

        console.log('--- Schema Corrigido com Sucesso! ---');
        process.exit(0);
    } catch (error) {
        console.error('X Falha na correção:', error);
        process.exit(1);
    }
}

fixSchema();
