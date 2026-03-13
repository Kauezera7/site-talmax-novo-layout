const db = require('./db');

async function migrate() {
    try {
        console.log("🚀 Iniciando migração para múltiplas categorias...");

        // 1. Criar a tabela de junção
        await db.query(`
            CREATE TABLE IF NOT EXISTS product_categories (
                product_id INT,
                category_id INT,
                PRIMARY KEY (product_id, category_id),
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
                FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
            )
        `);
        console.log("✅ Tabela 'product_categories' criada.");

        // 2. Migrar dados existentes
        // Só migra se houver dados e se a tabela de destino estiver vazia (para evitar duplicação)
        const [existing] = await db.query('SELECT count(*) as count FROM product_categories');
        
        if (existing[0].count === 0) {
            await db.query(`
                INSERT INTO product_categories (product_id, category_id)
                SELECT id, category_id FROM products WHERE category_id IS NOT NULL
            `);
            console.log("✅ Dados migrados com sucesso.");
        } else {
            console.log("ℹ️ Tabela 'product_categories' já possui dados, pulando migração inicial.");
        }

        console.log("🎉 Migração concluída com sucesso!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Erro na migração:", err);
        process.exit(1);
    }
}

migrate();
